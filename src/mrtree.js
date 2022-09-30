const mrTreeContainer = document.getElementById("mtcontainer");

// Create the canvas
const canvas = document.createElement("canvas");
canvas.id = "mtcanvas";
mrTreeContainer.append(canvas);

const ctx = canvas.getContext("2d");

// Set CANVAS width and height equal to its container
canvas.width = CANVAS_WIDTH = mrTreeContainer.clientWidth;
canvas.height = CANVAS_HEIGHT = mrTreeContainer.clientHeight;


class Position {
  constructor(x, y){
    this.m_X = x;
    this.m_Y = y;
  }
}

class NodeMrTree {
  constructor(id, name, childs, depth, parent) {
    this.m_Id = id;
    this.m_Name = name;
    this.m_Childs = childs;
    this.m_Depth = depth;
    this.m_Parent = parent;
    this.m_ChildIds = [];
    this.m_Position = null;
  }
}

class MrTree {

  constructor(config) {
    this.m_Tree = config["tree"];
    this.m_MarginSide = 5;
    this.traverseTree();
    this.determineDimensionForCanvas();
    this.drawTree();

    const elemLeft = mrTreeContainer.offsetLeft + mrTreeContainer.clientLeft;
    const elemTop = mrTreeContainer.offsetTop + mrTreeContainer.clientTop;

    const ref = this;
    canvas.addEventListener("click", function( event ){

      let x = event.pageX - elemLeft + CANVAS_WIDTH / 2;
      let y = event.pageY - elemTop + CANVAS_HEIGHT / 2;

      for(let nodeId in ref.m_InternalTree){
        const node = ref.m_InternalTree[nodeId];
        if(x >= node.m_Position.m_X && x <= (node.m_Position.m_X + ref.m_NodeWidth) &&
           y >= node.m_Position.m_Y && y <= node.m_Position.m_Y + ref.m_NodeHeight){
            config["interact"].onClickNode(node);
        }
      }

      console.log(x + " ; " + y);
    })
  }



  deepTraverse(child, depth, parentId) {

    const newNode = new NodeMrTree(
      Object.keys(this.m_InternalTree).length,
      child["name"],
      child["childs"],
      depth + 1,
      parentId
    );
    this.m_InternalTree[parentId].m_ChildIds.push(newNode.m_Id);
    this.m_InternalTree[newNode.m_Id] = newNode;

    if(newNode.m_Childs.length < 1){
      this.m_Leaves.push(newNode.m_Id);
      return;
    } else {
      for(let _child in newNode.m_Childs){
        this.deepTraverse(newNode.m_Childs[_child], depth + 1, newNode.m_Id);
      }
    }

  }

  traverseTree() {

    this.m_InternalTree = {}
    this.m_Leaves = [];

    const rootNode = new NodeMrTree(
      0,
      this.m_Tree["name"],
      this.m_Tree["childs"],
      0,
      null
    );
    this.m_InternalTree[rootNode.m_Id] = rootNode;

    if(rootNode.m_Childs.length < 1){
      this.m_Leaves.push(0);
      return;
    } else {
      for(let child in rootNode.m_Childs){
        this.deepTraverse(rootNode.m_Childs[child], 0, rootNode.m_Id);
      }
    }

  }

  determineDimensionForCanvas() {

    let maxStrLen = 0;
    this.m_MaxDepth = 0;
    for(let node in this.m_InternalTree){
      maxStrLen = Math.max(maxStrLen,this.m_InternalTree[node].m_Name.length);
      this.m_MaxDepth = Math.max(this.m_MaxDepth, this.m_InternalTree[node].m_Depth);
    }

    // Take into consideration margins between nodes and dont 
    // forget the side (2)
    this.m_NodeWidth = Math.floor( (CANVAS_WIDTH - (this.m_Leaves.length + 1) * this.m_MarginSide) / this.m_Leaves.length );
    this.m_NodeHeight = Math.floor(this.m_NodeWidth / 1.7); // Gold number;

    let sand = "";
    for(let c = 0; c < maxStrLen; c++){
      sand += "c";
    }

    this.m_FontSize = 30;
    ctx.font = this.m_FontSize.toString() + "px Arial";
    let currentWidth = ctx.measureText(sand).width
    while(currentWidth > this.m_NodeWidth - 4){
      this.m_FontSize--;
      ctx.font = this.m_FontSize.toString() + "px Arial";
      currentWidth = ctx.measureText(sand).width
    }

    this.m_MarginHeight = Math.floor( (CANVAS_HEIGHT - (this.m_MaxDepth + 1) * this.m_NodeHeight) /  (this.m_MaxDepth + 2));
  }

  drawBox(x, y, name) {
    ctx.fillStyle = 'rgb(247, 171, 45)';
    ctx.fillRect(x, y, this.m_NodeWidth, this.m_NodeHeight);
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.font = this.m_FontSize.toString() + "px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name, 
                 Math.floor(x + this.m_NodeWidth / 2), 
                 Math.floor(y + this.m_NodeHeight / 2));
  }

  drawLine(fromNode, toNode) {
    ctx.beginPath();
    ctx.moveTo(fromNode.m_Position.m_X + this.m_NodeWidth / 2,
               fromNode.m_Position.m_Y + this.m_NodeHeight);
    ctx.lineTo(toNode.m_Position.m_X +  this.m_NodeWidth / 2,
                toNode.m_Position.m_Y);
    ctx.stroke();
  }

  drawTree() {

    // https://stackoverflow.com/questions/59588599/how-to-write-text-inside-created-rectangle-on-canvas-using-fabric-js-canvas-libr

    // First we draw all leaves
    for(let l = 0; l< this.m_Leaves.length; l++){
      const node = this.m_InternalTree[this.m_Leaves[l]];
      let y = (node.m_Depth + 1)* this.m_MarginHeight + node.m_Depth * this.m_NodeHeight;
      let x = (l + 1) * this.m_MarginSide + l * this.m_NodeWidth;
      node.m_Position = new Position(x,y);
      this.drawBox(x, y, this.m_InternalTree[this.m_Leaves[l]].m_Name);
    }

    // Then depth by depth we first draw the parent of brother childs
    for(let d = this.m_MaxDepth; d > -1; d--){
      // Determine the brothers child at depth d
      let brothers = {};
      for(let nodeId in this.m_InternalTree){
        const node = this.m_InternalTree[nodeId];
        if(node.m_Depth == d){
          if(node.m_Parent != null){
            if (brothers[node.m_Parent] == undefined){
              brothers[node.m_Parent] = [];
            }
            brothers[node.m_Parent].push(node);
          }
        }
      }

      for (let parentId in brothers){
        let bary_x = 0;
        for(let n = 0; n<brothers[parentId].length; n++){
          bary_x += brothers[parentId][n].m_Position.m_X;
        }
        const node = this.m_InternalTree[parentId];
        let x = Math.floor(bary_x / brothers[parentId].length);
        let y = (node.m_Depth + 1)* this.m_MarginHeight + node.m_Depth * this.m_NodeHeight;
        node.m_Position = new Position(x,y);
        this.drawBox(x, y, node.m_Name);
      }
    }

    // Draw the arcs
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    for(let nodeId in this.m_InternalTree){
      const fromNode = this.m_InternalTree[nodeId];
      for(let i = 0; i < fromNode.m_ChildIds.length; i++){
        const toNode = this.m_InternalTree[fromNode.m_ChildIds[i]];
        this.drawLine(fromNode, toNode);
      }
    }
  }
}