const mytree = {
  "name": "nomenclature",
  "childs": [
    {
      "name": "land use",
      "childs": [
        {
          "name": "road",
          "childs": []
        },
        {
          "name": "buidling",
          "childs": [
            {
              "name": "house",
              "childs": []
            },
            {
              "name": "commercial",
              "childs": []
            }
          ]
        },
        {
          "name": "swimming pool",
          "childs": []
        },
      ]
    },
    {
      "name": "land cover",
      "childs": [
        {
          "name": "low vegetation",
          "childs": []
        },
        {
          "name": "high vegetation",
          "childs": []
        },
        {
          "name": "water",
          "childs": []
        }
      ]
    }
  ]
}

class TreeInteraction {
  constructor() {
  }
  onClickNode(node) {
    alert(node.m_Name);
  }
}

const myConfig = {
  "tree": mytree,
  "interact": new TreeInteraction()
}

const mrTree = new MrTree(myConfig);