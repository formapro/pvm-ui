const Viz = require("viz.js").default;
const renderer = require("viz.js/full.render");


const STATS_POPUP_ID = "stats-popup";
const STATS_POPUP_CLASS = "StatPopup";
const FAKE_POPUP = createStatsElement();
const pvm = {};

let viz = new Viz(renderer);
let curPopup = FAKE_POPUP;

function getRenderedGraph(digraph) {
  return viz.renderSVGElement(digraph).catch(err => {
    viz = new Viz(renderer);
    console.error(err.stack);
  });
}

function getJSONGraph(digraph) {
  return viz.renderJSONObject(digraph).catch(err => {
    viz = new Viz(renderer);
    console.error(err.stack);
  });
}

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

  document.body.addEventListener("click", ev => {
    if (curPopup !== FAKE_POPUP) {
      root.replaceChild(FAKE_POPUP, curPopup);
      curPopup = FAKE_POPUP;
    }
  });

  // === where ===

  function createGraphElHandler(elMap) {
    return function handleGraphElement(el) {
      const id = el.id;
      const nodeInfo = elMap[id];

      el.addEventListener("click", function(ev) {
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

        //        newPopup.addEventListener("click", function() {
        //          const fakePopup = createStatsElement();
        //
        //          root.replaceChild(fakePopup, newPopup);
        //          // popup.replaceWith(fakePopup);
        //        });

        curPopup = newPopup;

        root.replaceChild(newPopup, oldPopup);

        ev.stopPropagation();
        // stats.replaceWith(popup);
      });
    };
  }
}

function createStatsElement() {
  const el = document.createElement("div");
  el.id = STATS_POPUP_ID;
  el.className = STATS_POPUP_CLASS;
  return el;
}

function prettifyInfo(elInfo) {
  return JSON.stringify(elInfo, undefined, 2)
    .replace(/\n/g, "<br>")
    .replace(/\s/g, "&#8194");
}

pvm.renderGraph = renderGraph;
global.pvm = pvm;
