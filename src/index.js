const Viz = require("viz.js").default;
const renderer = require("viz.js/full.render");

const STATS_POPUP_ID = "stats-popup";
const STATS_POPUP_CLASS = "StatPopup";
const FAKE_POPUP = createStatsElement();
const pvm = {};

let viz = new Viz(renderer);
let curPopup = FAKE_POPUP;
// let curNodeInfo = null;

function getRenderedGraph(digraph) {
  return viz.renderSVGElement(digraph).catch(err => {
    viz = new Viz(renderer);
    console.error(err.stack);
  });
}

function renderGraph({ dot, process, tokens }, rootId) {
  if (document.readyState === "interactive") {
    execRenderGraph();
  } else {
    document.addEventListener("DOMContentLoaded", execRenderGraph);
  }

  async function execRenderGraph() {
    const root = rootId ? document.getElementById(rootId) : document.body;
    const fakePopup = createStatsElement();
    const svgGraph = await getRenderedGraph(dot);
    // const cachedTransitionsInfo = {};

    root.append(fakePopup);
    root.append(svgGraph);

    const nodes = document.getElementsByClassName("node");
    const edges = document.getElementsByClassName("edge");

    for (const node of nodes) {
      createGraphElHandler(getNodeById, prettifyNode)(node);
      emphasizeNodeOnMouseOver(node);
    }
    for (const edge of edges) {
      createGraphElHandler(getTransitionById, prettifyTransition)(edge);
      emphasizeEdgeOnMouseOver(edge);
    }

    document.body.addEventListener("click", hidePopupStats);

    // === where ===

    function createGraphElHandler(getElement, prettifyInfo) {
      return function handleGraphElement(el) {
        const id = el.id;
        const elemInfo = getElement(id);

        if (!elemInfo) return;

        el.addEventListener("click", function(ev) {
          const oldPopup = document.getElementById(STATS_POPUP_ID);
          const clientRect = el.getBoundingClientRect();
          const newPopup = fillStatsElement(prettifyInfo(elemInfo), clientRect);

          // curNodeInfo = nodeInfo;
          curPopup = newPopup;
          root.replaceChild(newPopup, oldPopup); // newPopup.replaceWith(oldPopup);

          if (elemInfo.tokens) {
            const tokenElements = document.getElementsByClassName("token");

            for (const tokenEl of tokenElements) {
              tokenEl.addEventListener("click", ev => {
                const tokenInfo = elemInfo.tokens.find(
                  t => t.token.id === tokenEl.dataset.id
                );
                curPopup.innerHTML = prettifyToken(tokenInfo);
                ev.stopPropagation();
              });
            }
          }

          newPopup.addEventListener("click", ev => ev.stopPropagation());

          ev.stopPropagation();
        });
      };
    }

    function getNodeById(id) {
      return process.nodes[id];
    }

    function getTransitionById(id) {
      // if (cachedTransitionsInfo[id]) return cachedTransitionsInfo[id];

      const transition = process.transitions[id];

      if (!transition) return;

      const trTokens = [];

      for (const token of tokens) {
        const passedTransitions = token.transitions
          .filter(tokTr => tokTr.transitionId === transition.id)
          .sort((a, b) => a.time - b.time);

        for (const passedTransInfo of passedTransitions) {
          trTokens.push({
            token: { ...token, transitions: undefined },
            state: passedTransInfo.state
          });
        }
      }

      const trInfo = { transition, tokens: trTokens };

      // cachedTransitionsInfo[transition.id] = trInfo;

      return trInfo;
    }

    function hidePopupStats() {
      if (curPopup !== FAKE_POPUP) {
        root.replaceChild(FAKE_POPUP, curPopup);
        curPopup = FAKE_POPUP;
      }
    }
  }
}

function createStatsElement() {
  const el = document.createElement("div");
  el.id = STATS_POPUP_ID;
  el.className = STATS_POPUP_CLASS;
  el.style.minWidth = "500px";
  el.style.position = "absolute";
  return el;
}

function fillStatsElement(nodeInfo, { top, left, width }) {
  const newPopup = createStatsElement();
  newPopup.innerHTML = nodeInfo;
  newPopup.style.backgroundColor = "#eee";
  newPopup.style.color = "#123";
  newPopup.style.padding = "10px";
  newPopup.style.borderRadius = "3px";
  newPopup.style.top = window.scrollY + top + "px";
  newPopup.style.left = window.scrollX + left + width + 10 + "px";
  return newPopup;
}

function prettifyNode(nodeInfo) {
  const json = prettifyJSON(nodeInfo);

  return "Node:<br><br>" + json;
}

function prettifyTransition(info) {
  const transition = prettifyJSON(info.transition);
  const tokens = prettifyTokens(info.tokens);

  return (
    "Transition:<br><br>" + transition + "<br><br>" + "Tokens:<br><br>" + tokens
  );
}

function prettifyTokens(tokens) {
  return tokens
    .map(
      tInfo =>
        `<div data-id=${tInfo.token.id} class=${"token"}>${tInfo.token.id} - 
${tInfo.state}</div>`
    )
    .join("");
}

function prettifyToken(tokenInfo) {
  const json = prettifyJSON(tokenInfo.token);

  return "Token:<br><br>" + json;
}

function prettifyJSON(obj) {
  return JSON.stringify(obj, undefined, 2)
    .replace(/\n/g, "<br>")
    .replace(/\s\s/g, "&#8194&#8194");
}

function emphasizeEdgeOnMouseOver(edge) {
  edge.addEventListener("mouseover", ev => {
    const path = edge.querySelector("path");
    const polygon = edge.querySelector("polygon");

    path.setAttribute("stroke-width", 3);
    path.style.cursor = "pointer";
    polygon.style.cursor = "pointer";
  });
  edge.addEventListener("mouseleave", ev => {
    const path = edge.querySelector("path");
    const polygon = edge.querySelector("polygon");

    path.setAttribute("stroke-width", 1);
    path.style.cursor = "auto";
    polygon.style.cursor = "auto";
  });
}

function emphasizeNodeOnMouseOver(node) {
  node.addEventListener("mouseover", ev => {
    const polygon = node.querySelector("polygon");

    polygon.setAttribute("stroke-width", 3);
    polygon.style.backgroundColor = "#999";
    node.style.cursor = "pointer";
  });
  node.addEventListener("mouseleave", ev => {
    const polygon = node.querySelector("polygon");

    polygon.setAttribute("stroke-width", 1);
    polygon.style.backgroundColor = "#fff";
    node.style.cursor = "auto";
  });
}

pvm.renderGraph = renderGraph;
global.pvm = pvm;
