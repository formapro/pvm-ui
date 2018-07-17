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

async function renderGraph({ dot, process, tokens }, rootId) {
  const root = rootId ? document.getElementById(rootId) : document.body;
  const cachedTransitionsInfo = {};
  const fakePopup = createStatsElement();
  const svgGraph = await getRenderedGraph(dot);

  root.append(fakePopup);
  root.append(svgGraph);

  const nodes = document.getElementsByClassName("node");
  const edges = document.getElementsByClassName("edge");

  for (const node of nodes) createGraphElHandler(getNodeById)(node);
  for (const edge of edges) createGraphElHandler(getTransitionById)(edge);

  document.body.addEventListener("click", ev => {
    if (curPopup !== FAKE_POPUP) {
      root.replaceChild(FAKE_POPUP, curPopup);
      curPopup = FAKE_POPUP;
    }
  });

  // === where ===

  function createGraphElHandler(getElement) {
    return function handleGraphElement(el) {
      const id = el.id;
      const nodeInfo = getElement(id);

      if (!nodeInfo) return;

      el.addEventListener("click", function(ev) {
        const oldPopup = document.getElementById(STATS_POPUP_ID);
        const clientRect = el.getBoundingClientRect();
        const newPopup = fillStatsElement(nodeInfo, clientRect);

        // curNodeInfo = nodeInfo;
        curPopup = newPopup;
        root.replaceChild(newPopup, oldPopup); // newPopup.replaceWith(oldPopup);

        if (nodeInfo.tokens) {
          const tokenElements = document.getElementsByClassName("token");

          for (const tokenEl of tokenElements) {
            tokenEl.addEventListener("click", ev => {
              const tokenInfo = nodeInfo.tokens.find(t => t.id === tokenEl.id);
              curPopup.innerHTML = prettifyInfo(tokenInfo);
              ev.stopPropagation();
            });
          }
        }

        ev.stopPropagation();
      });

    };
  }

  function getNodeById(id) {
    return process.nodes[id];
  }

  function getTransitionById(id) {
    if (cachedTransitionsInfo[id]) return cachedTransitionsInfo[id];

    const tr = process.transitions[id];

    if (!tr) return;

    const trTokens = tokens
      .filter(token =>
        token.transitions.find(tokTr => tokTr.transitionId === tr.id)
      )
      .map(t => ({ ...t, transitions: undefined }));

    const trInfo = { ...tr, tokens: trTokens };

    cachedTransitionsInfo[tr.id] = trInfo;

    return trInfo;
  }
}

function createStatsElement() {
  const el = document.createElement("div");
  el.id = STATS_POPUP_ID;
  el.className = STATS_POPUP_CLASS;
  return el;
}

function fillStatsElement(nodeInfo, { top, left, width }) {
  const newPopup = createStatsElement();
  newPopup.innerHTML = prettifyInfo(nodeInfo);
  newPopup.style.backgroundColor = "#eee";
  newPopup.style.color = "#123";
  newPopup.style.padding = "10px";
  newPopup.style.position = "absolute";
  newPopup.style.borderRadius = "3px";
  newPopup.style.top = window.scrollY + top + "px";
  newPopup.style.left = window.scrollX + left + width + 10 + "px";
  return newPopup;
}

function prettifyInfo(elInfo) {
  let tokens = undefined;
  if (elInfo.tokens)
    tokens = elInfo.tokens.map(
      t => `<span id=${t.id} class=${"token"}>${t.id}</span>`
    );

  return JSON.stringify({ ...elInfo, tokens }, undefined, 2)
    .replace(/\n/g, "<br>")
    .replace(/\s\s/g, "&#8194&#8194");
}

pvm.renderGraph = renderGraph;
global.pvm = pvm;
