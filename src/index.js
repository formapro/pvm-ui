const Viz = require("viz.js").default;
const renderer = require("viz.js/full.render");

let viz = new Viz(renderer);

const STATS_POPUP_ID = "stats-popup";
const pvm = {};

function getRenderedGraph(digraph) {
  return viz.renderSVGElement(digraph).catch(err => {
    viz = new Viz(renderer);
    console.error(err.stack);
  });
};

function getJSONGraph(digraph) {
  return viz.renderJSONObject(digraph).catch(err => {
    viz = new Viz(renderer);
    console.error(err.stack);
  });
};

async function renderGraph({ dot, process }, rootId) {
  const root = rootId ? document.getElementById(rootId) : document.body;
  const fakePopup = createStatsElement();
  const svgGraph = await getRenderedGraph(dot);
  const graphNodesMap = process.nodes;
  const graphEdgesMap = process.transitions;

  root.append(fakePopup);
  root.append(svgGraph);

  const nodes = document.getElementsByClassName("node");
  const edges = document.getElementsByClassName("edge");

  for (const node of nodes) createGraphElHandler(graphNodesMap)(node);
  for (const edge of edges) createGraphElHandler(graphEdgesMap)(edge);

  function createGraphElHandler(elMap) {
    return function handleGraphElement(el) {
      const id = el.id;
      const nodeInfo = elMap[id];

      el.addEventListener("click", function() {
        const oldPopup = document.getElementById(STATS_POPUP_ID);
        const { top, left, width } = el.getBoundingClientRect();

        const newPopup = createStatsElement();
        newPopup.innerHTML = prettifyInfo(nodeInfo);
        newPopup.style.backgroundColor = "#eee";
        newPopup.style.color = "#123";
        newPopup.style.padding = "10px";
        newPopup.style.position = "absolute";
        newPopup.style.borderRadius = "3px";
        newPopup.style.top = window.scrollY + top + "px";
        newPopup.style.left = window.scrollX + left + width + 10 + "px";

        newPopup.addEventListener("click", function() {
          const fakePopup = createStatsElement();

          root.replaceChild(fakePopup, newPopup);
          // popup.replaceWith(fakePopup);
        });

        root.replaceChild(newPopup, oldPopup);
        // stats.replaceWith(popup);
      });
    };
  }
}

function createStatsElement() {
  const el = document.createElement("div");
  el.id = STATS_POPUP_ID;
  return el;
}

function prettifyInfo(elInfo) {
  const rows = Object.entries(elInfo).map(([key, val]) => {
    return `<tr><td>${key}</td><td>${JSON.stringify(val, undefined, 2).replace(/\n/g, "<br>").replace(/\s/g, "&#8194")}</td></tr>`;
  })
  return '<table>' + rows.join("") + "</table>"
}

pvm.renderGraph = renderGraph;
global.pvm = pvm;
