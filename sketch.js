// I shortened the visible algo (got rid of checking if intecepts with parent shape)
// fix the sclar to be more exact

let allShapes = new Set(); // global array of all shapes made
let allguards = new Set(); // global array of all security guards made
const SecurityGuardNames = [
  [0, 0, 255],
  [0, 255, 0],
  [255, 0, 0],
];
let pointClicked = false;
let shapeClicked = false;
let securityGuardClicked = false;
let doubleClick = false;

let HEXAGON_ROUNDING_ERROR = 1e-15;
let shapeDragged = -1;
let shapesPointDragged;
let pointDragged = -1;
let guardDragged = -1;
let gameShape;
let intersectionPointsGlobal = new Map();
let temphelp = 0;

function getScrollBarWidth() {
  var $outer = $("<div>")
      .css({ visibility: "hidden", width: 100, overflow: "scroll" })
      .appendTo("body"),
    widthWithScroll = $("<div>")
      .css({ width: "100%" })
      .appendTo($outer)
      .outerWidth();
  $outer.remove();
  return 100 - widthWithScroll;
}

function setup() {
  createCanvas(
    document.documentElement.clientWidth - getScrollBarWidth(),
    document.documentElement.clientHeight
  );
  frameRate(60);
  polygon(null, null, null, 4);
}

function draw() {
  background(102);
  dragSecurityGuard();
  dragPoint();
  dragShape();
  renderAllShapes();
  renderAllSecurityGuards();
  renderAllShapesPoints();
  renderVertexClicked();
}

// from the HTML form
function sidesInput() {
  let nPoints = document.getElementById("name").value;
  if (nPoints > 30) nPoints = 30;
  polygon(100, 100, 45, nPoints);
}

// from the HTML form
function SecurityGuardInput() {
  if (SecurityGuardNames.length !== 0) {
    guard = new SecurityGuard(27.5, 150, SecurityGuardNames.pop());
    for (let eachShape of allShapes) {
      let currentVertex = eachShape.getVertexHead();
      do {
        currentVertex.setSecurityGuardAngle(guard);

        currentVertex = currentVertex.getPointNext();
      } while (currentVertex !== eachShape.getVertexHead());
    }
    guard.addAllVertices();
    guard.sortVertices();
    allguards.add(guard);
  }
}

// gets parameters ready to make the new polygon
function polygon(x, y, radius, npoints) {
  let angle = TWO_PI / npoints;
  let vertexes = []; // temp vertexes array to be passed into Shape constructor
  let copyVertexes = [];
  let newShape = null;
  // gets the vertexes ready and puts them into temp array

  if (allShapes.size === 0) {
    newShape = new Shape(npoints, "black");
    gameShape = newShape;
    let stage = [
      new Point(0, 0, newShape),
      new Point(width, 0, newShape),
      new Point(width, height, newShape),
      new Point(0, height, newShape),
    ];
    for (let i = 0; i < stage.length; i += 1) {
      vertexes.push(stage[i]);
    }
  } else {
    newShape = new Shape(npoints, "white");

    if (temphelp === 0) {
      // vertexes.push(new Point(110, 100, newShape));
      // copyVertexes.push([110, 100]);
      // vertexes.push(new Point(90, 100, newShape));
      // copyVertexes.push([90, 100]);
      vertexes.push(new Point(70, 100, newShape));
      copyVertexes.push([70, 100]);
      vertexes.push(new Point(70, 150, newShape));
      copyVertexes.push([70, 150]);
      vertexes.push(new Point(85, 150, newShape));
      copyVertexes.push([85, 150]);
      // vertexes.push(new Point(100, 150, newShape));
      // copyVertexes.push([100, 150]);
      // vertexes.push(new Point(130, 150, newShape));
      // copyVertexes.push([130, 150]);
      vertexes.push(new Point(150, 150, newShape));
      copyVertexes.push([150, 150]);
      vertexes.push(new Point(150, 100, newShape));
      copyVertexes.push([150, 100]);
    } else {
      vertexes.push(new Point(200, 100, newShape));
      copyVertexes.push([200, 100]);
      vertexes.push(new Point(200, 150, newShape));
      copyVertexes.push([200, 150]);
      vertexes.push(new Point(280, 150, newShape));
      copyVertexes.push([280, 150]);
      vertexes.push(new Point(280, 100, newShape));
      copyVertexes.push([280, 100]);
    }
    temphelp += 1;

    // for (let i = 0; i < TWO_PI - HEXAGON_ROUNDING_ERROR; i += angle) {
    //   let sx = x + cos(i) * radius;
    //   let sy = y + sin(i) * radius;
    //   vertexes.push(new Point(sx, sy, newShape));
    //   copyVertexes.push([sx, sy]);
    // }
  }

  newShape.setVerticesLinkedList(vertexes);
  newShape.setEdges();
  allShapes.add(newShape);

  for (let eachShape of allShapes) {
    let currentVertex = eachShape.getVertexHead();
    do {
      for (let guard of allguards) {
        currentVertex.setSecurityGuardAngle(guard);
      }
      currentVertex = currentVertex.getPointNext();
    } while (currentVertex !== eachShape.getVertexHead());
  }

  for (let guard of allguards) {
    guard.addAllVertices();
    guard.sortVertices();
  }
}

function renderAllSecurityGuards() {
  for (let guard of allguards) {
    guard.drawSecurityGuard();
  }

  for (let guard of allguards) {
    if (guardDragged !== -1) guard = guardDragged;

    guard.visibleVertices();

    push();
    fill(guard.getName()[0], guard.getName()[1], guard.getName()[2], 100);
    pop();

    if (guardDragged !== -1) break;
  }
}

function renderVertexClicked() {
  if (pointDragged != -1) {
    push();
    strokeWeight(15);
    stroke([255, 233, 0]);
    point(pointDragged.getX(), pointDragged.getY());
    pop();
  }
}

function renderAllShapes() {
  for (let shape of allShapes) {
    push();
    if (shapeDragged === shape) {
      fill([255, 233, 0]);
    } else fill(shape.getColor());
    beginShape();

    let aVertex = shape.getVertexHead();
    do {
      push();
      if (aVertex.getIncludeInRender() === true)
        vertex(aVertex.getX(), aVertex.getY());
      pop();
      aVertex = aVertex.getPointNext();
    } while (aVertex !== shape.vertexHead);
    endShape(CLOSE);
    pop();
  }
}

function renderAllShapesPoints() {
  for (let shape of allShapes) {
    let currentVertex = shape.getVertexHead();
    do {
      if (currentVertex.getIncludeInRender() === true) {
        push();
        strokeWeight(10);
        stroke("white");
        point(currentVertex.getX(), currentVertex.getY());
        strokeWeight(5);
        stroke("black");
        point(currentVertex.getX(), currentVertex.getY());
        pop();
      }
      currentVertex = currentVertex.getPointNext();
    } while (currentVertex !== shape.vertexHead);
  }
}

function deleteTheSelfIntersect(shape) {
  let aVertex = shape.getVertexHead();
  do {
    if (aVertex.getIncludeInRender() === false) {
      aVertex.getPointPrev().setPointNext(aVertex.getPointNext());
      aVertex.getPointNext().setPointPrev(aVertex.getPointPrev());
      aVertex = aVertex.getPointPrev();
    }
    aVertex = aVertex.getPointNext();
  } while (aVertex !== shape.vertexHead);

  shape.setEdges();
}

function checkIfClickAVertex() {
  if (pointClicked === true) return false;

  for (let eachShape of allShapes) {
    if (eachShape === gameShape) continue;

    let currentVertex = eachShape.getVertexHead();
    do {
      if (
        between(mouseX, currentVertex.getX() - 10, currentVertex.getX() + 10) &&
        between(mouseY, currentVertex.getY() - 10, currentVertex.getY() + 10) &&
        currentVertex.getIncludeInRender() === true
      ) {
        pointDragged = currentVertex;
        shapesPointDragged = eachShape;
        return true;
      }
      currentVertex = currentVertex.getPointNext();
    } while (currentVertex !== eachShape.getVertexHead());
  }
  return false;
}

function doubleClicked() {
  doubleClick = true;
}

function mouseClicked() {
  if (doubleClick) {
    doubleClick = shapeClicked = securityGuardClicked = false;

    return;
  }

  if (securityGuardClicked) {
    securityGuardClicked = false;
    guardDragged = -1;
  } else if (checkIfClickSecurityGuard()) securityGuardClicked = true;
  else if (pointClicked) {
    pointClicked = false;
    pointDragged = -1;
  } else if (checkIfClickAVertex()) pointClicked = true;
  else if (shapeClicked) {
    shapeClicked = false;
    shapeDragged = -1;
  } else if (checkIfClickInsideShape()) shapeClicked = true;
}

function checkIfClickInsideShape() {
  if (shapeClicked === true) return false;

  for (let shape of allShapes) {
    if (shape === gameShape) continue;
    let lineSegmentCrossesCounter = 0; // for ray trace algorithm
    for (let edge of shape.getEdges()) {
      if (
        checkIfIntersect(
          new Line(
            new Point(mouseX, mouseY, null),
            new Point(width, mouseY, null)
          ),
          edge
        )
      ) {
        lineSegmentCrossesCounter += 1;
      }
    }

    // ray tracing algorithm says if line segment crosses === odd num, then click is inside the shape
    if (lineSegmentCrossesCounter % 2 === 1) {
      shapeDragged = shape;

      updateVertexArrayDistancetoMousePress(shape);
      return true;
    }
  }
}

function checkIfClickSecurityGuard() {
  if (securityGuardClicked === true) return false;

  for (let guard of allguards) {
    if (
      between(mouseX, guard.getX() - 10, guard.getX() + 10) &&
      between(mouseY, guard.getY() - 10, guard.getY() + 10)
    ) {
      guardDragged = guard;
      return true;
    }
  }
}

function updateVertexArrayDistancetoMousePress(shape) {
  shape.verticesDistancetoMousePress = new Map();

  let currentVertex = shape.getVertexHead();
  do {
    // the meat
    deltaX = mouseX - currentVertex.getX();
    deltaY = mouseY - currentVertex.getY();
    shape.setVerticesDistancetoMousePress(currentVertex, [deltaX, deltaY]);
    currentVertex = currentVertex.getPointNext();
  } while (currentVertex !== shape.getVertexHead());
}

function dragPoint() {
  if (doubleClick === true || pointDragged === -1) {
    pointDragged = -1;
    return;
  }
  if (pointClicked === true) {
    pointDragged.setX(mouseX);
    pointDragged.setY(mouseY);
    shapesPointDragged.setEdges();
    updateVertexArrayDistancetoMousePress(shapesPointDragged);

    for (let eachShape of allShapes) {
      let currentVertex = eachShape.getVertexHead();
      do {
        for (let guard of allguards) {
          currentVertex.setSecurityGuardAngle(guard);
        }
        currentVertex = currentVertex.getPointNext();
      } while (currentVertex !== eachShape.getVertexHead());
    }

    for (let guard of allguards) {
      guard.addAllVertices();
      guard.sortVertices();
    }
  }
}

function dragSecurityGuard() {
  if (doubleClick === true || guardDragged === -1) {
    guardDragged = -1;
    return;
  }
  if (securityGuardClicked === true) {
    guardDragged.setX(mouseX);
    guardDragged.setY(mouseY);

    for (let eachShape of allShapes) {
      let currentVertex = eachShape.getVertexHead();
      do {
        currentVertex.setSecurityGuardAngle(guardDragged);
        currentVertex = currentVertex.getPointNext();
      } while (currentVertex !== eachShape.getVertexHead());
    }
    guardDragged.sortVertices();
  }
}

function dragShape() {
  if (doubleClick === true || shapeDragged === -1) {
    shapeDragged = -1;
    return;
  }
  if (shapeClicked === true) {
    let currentVertex = shapeDragged.getVertexHead();
    do {
      deltaXCurrent = mouseX - currentVertex.getX();
      deltaYCurrent = mouseY - currentVertex.getY();
      deltaX = shapeDragged.getVerticesDistancetoMousePress(currentVertex)[0];
      deltaY = shapeDragged.getVerticesDistancetoMousePress(currentVertex)[1];
      currentVertex.setX(currentVertex.getX() + deltaXCurrent - deltaX);

      currentVertex.setY(currentVertex.getY() + deltaYCurrent - deltaY);
      currentVertex = currentVertex.getPointNext();
    } while (currentVertex !== shapeDragged.getVertexHead());

    shapeDragged.setEdges();

    for (let eachShape of allShapes) {
      let currentVertex = eachShape.getVertexHead();
      do {
        for (let guard of allguards) {
          currentVertex.setSecurityGuardAngle(guard);
        }
        currentVertex = currentVertex.getPointNext();
      } while (currentVertex !== eachShape.getVertexHead());
    }

    for (let guard of allguards) {
      guard.sortVertices();
    }
  }
}

function findIntersection(line1, line2) {
  let px =
    ((line1.getPoint1().getX() * line1.getPoint2().getY() -
      line1.getPoint1().getY() * line1.getPoint2().getX()) *
      (line2.getPoint1().getX() - line2.getPoint2().getX()) -
      (line1.getPoint1().getX() - line1.getPoint2().getX()) *
        (line2.getPoint1().getX() * line2.getPoint2().getY() -
          line2.getPoint1().getY() * line2.getPoint2().getX())) /
    ((line1.getPoint1().getX() - line1.getPoint2().getX()) *
      (line2.getPoint1().getY() - line2.getPoint2().getY()) -
      (line1.getPoint1().getY() - line1.getPoint2().getY()) *
        (line2.getPoint1().getX() - line2.getPoint2().getX()));
  let py =
    ((line1.getPoint1().getX() * line1.getPoint2().getY() -
      line1.getPoint1().getY() * line1.getPoint2().getX()) *
      (line2.getPoint1().getY() - line2.getPoint2().getY()) -
      (line1.getPoint1().getY() - line1.getPoint2().getY()) *
        (line2.getPoint1().getX() * line2.getPoint2().getY() -
          line2.getPoint1().getY() * line2.getPoint2().getX())) /
    ((line1.getPoint1().getX() - line1.getPoint2().getX()) *
      (line2.getPoint1().getY() - line2.getPoint2().getY()) -
      (line1.getPoint1().getY() - line1.getPoint2().getY()) *
        (line2.getPoint1().getX() - line2.getPoint2().getX()));
  return new Point(px, py, null);
}

function between(theThing, min, max) {
  return theThing >= min && theThing <= max;
}

function onSegment(p, q, r) {
  if (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  )
    return true;

  return false;
}

function orientOrder(p, q, r) {
  let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

  if (val == 0) return 0;

  return val > 0 ? 1 : 2;
}

function distanceBetweenTwoPoints(p1, p2) {
  return Math.sqrt((p1.getX() - p2.getX()) ** 2 + (p1.getY() - p2.getY()) ** 2);
}

function checkIfIntersect(line1, line2) {
  let p1 = line1.getPoint1();
  let q1 = line1.getPoint2();
  let p2 = line2.getPoint1();
  let q2 = line2.getPoint2();

  let o1 = orientOrder(p1, q1, p2);
  let o2 = orientOrder(p1, q1, q2);
  let o3 = orientOrder(p2, q2, p1);
  let o4 = orientOrder(p2, q2, q1);

  if (o1 != o2 && o3 != o4) return true;

  if (o1 == 0 && onSegment(p1, p2, q1)) return true;

  if (o2 == 0 && onSegment(p1, q2, q1)) return true;

  if (o3 == 0 && onSegment(p2, p1, q2)) return true;

  if (o4 == 0 && onSegment(p2, q1, q2)) return true;

  return false;
}

function checkIfTwoPointsOverlap(p1, p2) {
  return p1.getX() === p2.getX() && p1.getY() === p2.getY();
}

function checkIfTwoPointsOverlapRounded(p1, p2) {
  return (
    Math.round(p1.getX() * 100) / 100 === Math.round(p2.getX() * 100) / 100 &&
    Math.round(p1.getY() * 100) / 100 === Math.round(p2.getY() * 100) / 100
  );
}

function checkIfVertexIsEndPointOfALine(aVertex, aLine) {
  return (
    checkIfTwoPointsOverlap(aVertex, aLine.getPoint1()) ||
    checkIfTwoPointsOverlap(aVertex, aLine.getPoint2())
  );
}

function checkIfTwoLinesIntersectOnEndPoints(line1, line2) {
  return (
    checkIfTwoPointsOverlap(line1.getPoint1(), line2.getPoint1()) ||
    checkIfTwoPointsOverlap(line1.getPoint2(), line2.getPoint2()) ||
    checkIfTwoPointsOverlap(line1.getPoint1(), line2.getPoint2()) ||
    checkIfTwoPointsOverlap(line1.getPoint2(), line2.getPoint1())
  );
}

function checkIfTwoLinesIntersectOnEndPointsRounded(line1, line2) {
  return (
    checkIfTwoPointsOverlapRounded(line1.getPoint1(), line2.getPoint1()) ||
    checkIfTwoPointsOverlapRounded(line1.getPoint2(), line2.getPoint2()) ||
    checkIfTwoPointsOverlapRounded(line1.getPoint1(), line2.getPoint2()) ||
    checkIfTwoPointsOverlapRounded(line1.getPoint2(), line2.getPoint1())
  );
}

class Shape {
  constructor(nPoints, color) {
    this.nPoints = nPoints;
    this.vertexHead;
    this.orignalVertexHead;
    this.verticesDistancetoMousePress = new Map();
    this.edges = new Set();
    this.color = color;
  }

  setVerticesLinkedList(vertexArray) {
    vertexArray[0].setPointPrev(vertexArray[vertexArray.length - 1]);
    vertexArray[0].setPointNext(vertexArray[1]);
    this.vertexHead = vertexArray[0];

    vertexArray[vertexArray.length - 1].setPointPrev(
      vertexArray[vertexArray.length - 2]
    );
    vertexArray[vertexArray.length - 1].setPointNext(vertexArray[0]);

    for (let i = 1; i < vertexArray.length - 1; i += 1) {
      vertexArray[i].setPointPrev(vertexArray[i - 1]);
      vertexArray[i].setPointNext(vertexArray[i + 1]);
    }
  }

  setEdges() {
    this.edges = new Set();

    let currentVertex = this.vertexHead;
    do {
      let aLine = new Line(currentVertex, currentVertex.getPointNext());
      currentVertex.setLineNext(aLine);
      currentVertex.getPointNext().setLinePrev(aLine);
      this.edges.add(aLine);
      currentVertex = currentVertex.getPointNext();
    } while (currentVertex !== this.vertexHead);
  }

  setVerticesDistancetoMousePress(theVertex, coordinate) {
    this.verticesDistancetoMousePress.set(theVertex, coordinate);
  }

  getEdges() {
    return this.edges;
  }

  getVerticesDistancetoMousePress(theVertex) {
    return this.verticesDistancetoMousePress.get(theVertex);
  }

  getColor() {
    return this.color;
  }

  getVertexHead() {
    return this.vertexHead;
  }
}

class Line {
  constructor(p1, p2) {
    this.point1 = p1;
    this.point2 = p2;
    this.position = null;
    this.positionPrior = null;
  }

  setPosition(position) {
    this.position = position;
  }
  setPositionPrior(positionPrior) {
    this.positionPrior = positionPrior;
  }

  setPoint1(p1) {
    this.point1 = p1;
  }

  setPoint2(p2) {
    this.point2 = p2;
  }

  getPoint1() {
    return this.point1;
  }

  getPoint2() {
    return this.point2;
  }

  getPosition() {
    return this.position;
  }

  getPositionPrior() {
    return this.positionPrior;
  }
}

class Point {
  constructor(x, y, parentShape) {
    this.x = x;
    this.y = y;
    this.pointPrev = null;
    this.pointNext = null;
    this.parentShape = parentShape;
    this.secuirtyGuardMap = new Map();
    this.extendo = new Map();
    this.extendedFrom = new Map();
    this.includeInRender = true;
    this.lineToPointPrev;
    this.lineToPointNext;
  }

  setIncludeInRender(yesOrNo) {
    this.includeInRender = yesOrNo;
  }

  setSecurityGuardAngle(guard) {
    let a = this.x - guard.getX();
    let o = -this.y + guard.getY();
    let angle = Math.atan2(o, a);

    if (angle < 0) {
      angle += TWO_PI;
    }

    this.secuirtyGuardMap.set(guard.getName(), angle);
  }

  setX(x) {
    this.x = x;
  }

  setY(y) {
    this.y = y;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getParentShape() {
    return this.parentShape;
  }

  setPointPrev(point) {
    this.pointPrev = point;
  }

  setPointNext(point) {
    this.pointNext = point;
  }

  setLinePrev(aline) {
    this.lineToPointPrev = aline;
  }

  setLineNext(aline) {
    this.lineToPointNext = aline;
  }

  getPointPrev() {
    return this.pointPrev;
  }

  getPointNext() {
    return this.pointNext;
  }

  getLinePrev() {
    return this.lineToPointPrev;
  }

  getLineNext() {
    return this.lineToPointNext;
  }

  getAngleForSecurityGuard(guard) {
    return this.secuirtyGuardMap.get(guard);
  }

  getEdgeClosestToSecurityGuard(guard) {
    let vmain = createVector(
      this.x - guard.getX(),
      -(this.y - guard.getY()),
      0
    );

    let v1 = createVector(
      this.pointPrev.getX() - this.x,
      -(this.pointPrev.getY() - this.y),
      0
    );

    let v2 = createVector(
      this.pointNext.getX() - this.x,
      -(this.pointNext.getY() - this.y),
      0
    );

    let angleBetween1 = Math.abs(vmain.angleBetween(v1));
    let angleBetween2 = Math.abs(vmain.angleBetween(v2));
    if (angleBetween1 >= PI) angleBetween1 = angleBetween1 - PI;
    if (angleBetween2 >= PI) angleBetween2 = angleBetween2 - PI;

    if (angleBetween1 < angleBetween2) {
      return this.lineToPointPrev;
    } else return this.lineToPointNext;
  }

  getIncludeInRender() {
    return this.includeInRender;
  }
}

class SecurityGuard {
  constructor(x, y, name) {
    this.x = x;
    this.y = y;
    this.SecurityGuardPoint = new Point(this.x, this.y, null);
    this.name = name;
    this.size = 15;
    this.sortedVertices = [];
    this.constructedEdges = [];
    this.root;
    this.lineToRightWall;
  }

  visibleVertices() {
    this.root = null;
    this.lineToRightWall = new Line(
      new Point(this.x, this.y, null),
      new Point(width, this.y, null)
    );
    let leftPrev;
    let leftNew;

    this.initialIntersect();

    for (let i = 0; i < this.sortedVertices.length; i += 1) {
      // console.log(i);
      // preOrder(this.root);
      // console.log("done")
      let toRemove = [];
      let toAdd = [];
      this.lineToRightWall = new Line(
        new Point(this.x, this.y, null),
        new Point(
          this.sortedVertices[i].getX(),
          this.sortedVertices[i].getY(),
          null
        )
      );

      let crossProduct1 = p5.Vector.cross(
        createVector(
          this.sortedVertices[i].getX() - this.getX(),
          -(this.sortedVertices[i].getY() - this.getY()),
          0
        ),
        createVector(
          this.sortedVertices[i].getPointPrev().getX() -
            this.sortedVertices[i].getX(),
          -(
            this.sortedVertices[i].getPointPrev().getY() -
            this.sortedVertices[i].getY()
          ),
          0
        )
      ).dot(createVector(1, 1, 1));

      if (crossProduct1 > 0) toAdd.push(this.sortedVertices[i].getLinePrev());
      else if (crossProduct1 < 0)
        toRemove.push(this.sortedVertices[i].getLinePrev());

      let crossProduct2 = p5.Vector.cross(
        createVector(
          this.sortedVertices[i].getX() - this.getX(),
          -(this.sortedVertices[i].getY() - this.getY()),
          0
        ),
        createVector(
          this.sortedVertices[i].getPointNext().getX() -
            this.sortedVertices[i].getX(),
          -(
            this.sortedVertices[i].getPointNext().getY() -
            this.sortedVertices[i].getY()
          ),
          0
        )
      ).dot(createVector(1, 1, 1));

      if (crossProduct2 > 0) toAdd.push(this.sortedVertices[i].getLineNext());
      else if (crossProduct2 < 0)
        toRemove.push(this.sortedVertices[i].getLineNext());

      if (toAdd.length === 2) {
        if (
          checkIfTwoPointsOverlap(
            this.sortedVertices[i],
            toAdd[0].getPoint1()
          ) === false
        ) {
          let temp = toAdd[0].getPoint1();
          toAdd[0].setPoint1(toAdd[0].getPoint2());
          toAdd[0].setPoint2(temp);
        }

        if (
          checkIfTwoPointsOverlap(
            this.sortedVertices[i],
            toAdd[1].getPoint1()
          ) === false
        ) {
          let temp = toAdd[1].getPoint1();
          toAdd[1].setPoint1(toAdd[1].getPoint2());
          toAdd[1].setPoint2(temp);
        }

        leftPrev = getLeftmostLeaf(this.root).theKey;

        let vmain = createVector(
          this.sortedVertices[i].getX() - this.getX(),
          -(this.sortedVertices[i].getY() - this.getY()),
          0
        );

        let v1 = createVector(
          toAdd[0].getPoint2().getX() - toAdd[0].getPoint1().getX(),
          -(toAdd[0].getPoint2().getY() - toAdd[0].getPoint1().getY()),
          0
        );

        let v2 = createVector(
          toAdd[1].getPoint2().getX() - toAdd[1].getPoint1().getX(),
          -(toAdd[1].getPoint2().getY() - toAdd[1].getPoint1().getY()),
          0
        );

        let angleBetween1 = Math.abs(vmain.angleBetween(v1));
        let angleBetween2 = Math.abs(vmain.angleBetween(v2));

        if (angleBetween2 > angleBetween1) {
          let temp = toAdd[0];
          toAdd[0] = toAdd[1];
          toAdd[1] = temp;
        }

        this.root = insertNode(
          this.root,
          toAdd[0],
          this.sortedVertices[i],
          this,
          toAdd
        );
        this.root = insertNode(
          this.root,
          toAdd[1],
          this.sortedVertices[i],
          this,
          toAdd
        );

        // console.log("adding", toAdd[0]);
        // console.log("adding", toAdd[1]);

        leftNew = getLeftmostLeaf(this.root).theKey;
        if (leftPrev !== leftNew) {
          push();
          stroke("purple");
          strokeWeight(20);
          point(this.sortedVertices[i].getX(), this.sortedVertices[i].getY());
          pop();
        }
      } else if (toAdd.length === 1 && toRemove.length === 1) {
        leftPrev = getLeftmostLeaf(this.root).theKey;
        // console.log("updating", toRemove[0]);
        let toUpdate = searchAVLForNode(
          this.root,
          toRemove[0],
          false,
          this.sortedVertices[i],
          this
        );

        if (toUpdate === null) {
          console.log(i);
          console.alert();
        } else toUpdate.theKey = toAdd[0];

        leftNew = getLeftmostLeaf(this.root).theKey;
        if (leftPrev !== leftNew) {
          if (toRemove[0] !== leftPrev) {
            console.log("Big error 1!");
            console.alert();
          }
          push();
          stroke("purple");
          strokeWeight(20);
          point(this.sortedVertices[i].getX(), this.sortedVertices[i].getY());
          pop();
        }
      } else if (toRemove.length === 2) {
        if (
          checkIfTwoPointsOverlap(
            this.sortedVertices[i],
            toRemove[0].getPoint1()
          ) === false
        ) {
          let temp = toRemove[0].getPoint1();
          toRemove[0].setPoint1(toRemove[0].getPoint2());
          toRemove[0].setPoint2(temp);
        }

        if (
          checkIfTwoPointsOverlap(
            this.sortedVertices[i],
            toRemove[1].getPoint1()
          ) === false
        ) {
          let temp = toRemove[1].getPoint1();
          toRemove[1].setPoint1(toRemove[1].getPoint2());
          toRemove[1].setPoint2(temp);
        }

        let vmain = createVector(
          this.sortedVertices[i].getX() - this.getX(),
          -(this.sortedVertices[i].getY() - this.getY()),
          0
        );

        let v1 = createVector(
          toRemove[0].getPoint2().getX() - toRemove[0].getPoint1().getX(),
          -(toRemove[0].getPoint2().getY() - toRemove[0].getPoint1().getY()),
          0
        );

        let v2 = createVector(
          toRemove[1].getPoint2().getX() - toRemove[1].getPoint1().getX(),
          -(toRemove[1].getPoint2().getY() - toRemove[1].getPoint1().getY()),
          0
        );

        let angleBetween1 = Math.abs(vmain.angleBetween(v1));
        let angleBetween2 = Math.abs(vmain.angleBetween(v2));

        if (angleBetween2 > angleBetween1) {
          let temp = toRemove[0];
          toRemove[0] = toRemove[1];
          toRemove[1] = temp;
        }

        leftPrev = getLeftmostLeaf(this.root).theKey;

        this.root = deleteNode(
          this.root,
          toRemove[1],
          this.sortedVertices[i],
          this,
          toRemove
        );

        this.root = deleteNode(
          this.root,
          toRemove[0],
          this.sortedVertices[i],
          this,
          toRemove
        );

        leftNew = getLeftmostLeaf(this.root).theKey;

        // console.log("removing", toRemove[0]);
        // console.log("removing", toRemove[1]);

        if (leftPrev !== leftNew) {
          push();
          stroke("purple");
          strokeWeight(20);
          point(this.sortedVertices[i].getX(), this.sortedVertices[i].getY());
          pop();
        }
      } else if (toAdd.length === 1) {
        leftPrev = getLeftmostLeaf(this.root).theKey;
        this.root = insertNode(
          this.root,
          toAdd[0],
          this.sortedVertices[i],
          this,
          [false, false]
        );

        // console.log("adding", toAdd[0]);

        leftNew = getLeftmostLeaf(this.root).theKey;
        if (leftPrev !== leftNew) {
          push();
          stroke("purple");
          strokeWeight(20);
          point(this.sortedVertices[i].getX(), this.sortedVertices[i].getY());
          pop();
        }
      } else if (toRemove.length === 1) {
        leftPrev = getLeftmostLeaf(this.root).theKey;

        this.root = deleteNode(
          this.root,
          toRemove[0],
          this.sortedVertices[i],
          this,
          [false, false]
        );

        leftNew = getLeftmostLeaf(this.root).theKey;
        // console.log("removing", toRemove[0]);

        if (leftPrev !== leftNew) {
          push();
          stroke("purple");
          strokeWeight(20);
          point(this.sortedVertices[i].getX(), this.sortedVertices[i].getY());
          pop();
        }
      }
    }
  }

  lineSideToInsert(v_i, edge, other) {
    if (edge === null) return "DNE";
    let guardtov_i = new Line(new Point(this.x, this.y, null), v_i);
    if (checkIfIntersect(guardtov_i, edge) === true) {
      if (edge === other[0]) return "away";
      else if (edge === other[1]) return "toward";
      else return "away";
    }
    return "toward";
  }

  lineSideToDelete(v_i, edge, other, edgeToDelete) {
    if (edge === edgeToDelete) {
      return "found";
    }
    let guardtov_i = new Line(new Point(this.x, this.y, null), v_i);
    if (checkIfIntersect(guardtov_i, edge) === true) {
      if (edge === other[0]) return "away";
      else if (edge === other[1]) return "toward";
      else return "away";
    }
    return "toward";
  }

  lineSideToSearch(v_i, edge) {
    let guardtov_i = new Line(new Point(this.x, this.y, null), v_i);
    if (checkIfIntersect(guardtov_i, edge) === true) return "away";
    return "toward";
  }

  addAllVertices() {
    this.sortedVertices = [];
    for (let eachShape of allShapes) {
      let currentVertex = eachShape.getVertexHead();
      do {
        this.sortedVertices.push(currentVertex);
        currentVertex = currentVertex.getPointNext();
      } while (currentVertex !== eachShape.getVertexHead());
    }
  }

  sortVertices() {
    let name = this.name;
    let theGuard = this;
    this.sortedVertices.sort(function (a, b) {
      return (
        a.getAngleForSecurityGuard(name) - b.getAngleForSecurityGuard(name) ||
        distanceBetweenTwoPoints(
          new Point(theGuard.getX(), theGuard.getY(), null),
          a
        ) -
          distanceBetweenTwoPoints(
            new Point(theGuard.getX(), theGuard.getY(), null),
            b
          )
      );
    });
  }

  drawSecurityGuard() {
    push();
    stroke("white");
    strokeWeight(this.size + 5);
    point(this.x, this.y);

    strokeWeight(this.size);
    stroke(this.name);
    point(this.x, this.y);
    pop();
  }

  getAngleFromLinetoRightWall(edge) {
    if (edge.getPoint1().getX() === edge.getPoint2().getX()) return PI / 2;
    let angle = Math.atan(
      (edge.getPoint1().getY() - edge.getPoint2().getY()) /
        (edge.getPoint1().getX() - edge.getPoint2().getX())
    );
    if (angle < 0) angle = angle + PI;
    return angle;
  }

  initialIntersect() {
    // Add all edges intersecting lineToRightWall to the AVL Tree in order
    // of intersection, first being closest edge to security guard. Intersection
    // does not mean colinear edges with the lineToRightWall. Intersection does
    // not count endpoints, except when the edge goes below the lineToRightWall.
    // If it goes above then does not count.
    let initialIntersectEdges = [];
    for (let shape of allShapes) {
      for (let edge of shape.getEdges()) {
        if (checkIfIntersect(this.lineToRightWall, edge)) {
          if (edge.getPoint1().getAngleForSecurityGuard(this.name) === 0) {
            let crossProductPoint1 = p5.Vector.cross(
              createVector(
                edge.getPoint1().getX() - this.getX(),
                -(edge.getPoint1().getY() - this.getY()),
                0
              ),
              createVector(
                edge.getPoint2().getX() - edge.getPoint1().getX(),
                -(edge.getPoint2().getY() - edge.getPoint1().getY()),
                0
              )
            ).dot(createVector(1, 1, 1));

            if (crossProductPoint1 >= 0) continue;
          }
          if (edge.getPoint2().getAngleForSecurityGuard(this.name) === 0) {
            let crossProductPoint2 = p5.Vector.cross(
              createVector(
                edge.getPoint2().getX() - this.getX(),
                -(edge.getPoint2().getY() - this.getY()),
                0
              ),
              createVector(
                edge.getPoint1().getX() - edge.getPoint2().getX(),
                -(edge.getPoint1().getY() - edge.getPoint2().getY()),
                0
              )
            ).dot(createVector(1, 1, 1));

            if (crossProductPoint2 >= 0) continue;
          }
          let intersectionPoint = findIntersection(this.lineToRightWall, edge);
          let distanceFromIntersectiontoGuard = distanceBetweenTwoPoints(
            this.SecurityGuardPoint,
            intersectionPoint
          );
          edge.setPositionPrior(
            Math.round(distanceFromIntersectiontoGuard * 1000) / 1000
          );
          initialIntersectEdges.push(edge);
        }
      }
    }
    // sort edges closest intersection to farthest intersection. If tie, use angle to figure
    // out which edge is intersected first
    let guard = this;
    initialIntersectEdges.sort(function (a, b) {
      return (
        a.getPositionPrior() - b.getPositionPrior() ||
        guard.getAngleFromLinetoRightWall(b) -
          guard.getAngleFromLinetoRightWall(a)
      );
    });
    for (let i = 0; i < initialIntersectEdges.length; i += 1) {
      initialIntersectEdges[i].setPosition(i);
      this.root = insertNodeInitialIntersect(
        this.root,
        initialIntersectEdges[i]
      );
    }
  }

  setX(x) {
    this.x = x;
  }

  setY(y) {
    this.y = y;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getName() {
    return this.name;
  }
}

class Node {
  constructor(edge) {
    this.left = null;
    this.right = null;
    this.theKey = edge;
    this.getHeight = 1;
  }
}

function getLeftmostLeaf(N) {
  while (N.left !== null) {
    N = N.left;
  }
  return N;
}

// A utility function to get getHeight of the tree
function getHeight(N) {
  if (N == null) return 0;
  return N.getHeight;
}

// A utility function to get getMaximum of two integers
function getMax(a, b) {
  return a > b ? a : b;
}

function drawline(aline, c) {
  push();
  strokeWeight(14);
  stroke(c);
  line(
    aline.getPoint1().getX(),
    aline.getPoint1().getY(),
    aline.getPoint2().getX(),
    aline.getPoint2().getY()
  );
  pop();
}

// A utility function to right rotate subtree theRooted with y
// See the diagram given above.
function rightRotate(y) {
  let x = y.left;
  let T2 = x.right;

  // Perform rotation
  x.right = y;
  y.left = T2;

  // Update getHeights
  y.getHeight = getMax(getHeight(y.left), getHeight(y.right)) + 1;
  x.getHeight = getMax(getHeight(x.left), getHeight(x.right)) + 1;

  // Return new theRoot
  return x;
}

// A utility function to left rotate subtree theRooted with x
// See the diagram given above.
function leftRotate(x) {
  let y = x.right;
  let T2 = y.left;

  // Perform rotation
  y.left = x;
  x.right = T2;

  // Update getHeights
  x.getHeight = getMax(getHeight(x.left), getHeight(x.right)) + 1;
  y.getHeight = getMax(getHeight(y.left), getHeight(y.right)) + 1;

  // Return new theRoot
  return y;
}

// Get Balance factor of node N
function getBalance(N) {
  if (N == null) return 0;
  return getHeight(N.left) - getHeight(N.right);
}

function insertNodeInitialIntersect(node, theKey) {
  /* 1. Perform the normal BST rotation */

  if (node == null) return new Node(theKey);

  if (theKey.getPosition() < node.theKey.getPosition())
    node.left = insertNodeInitialIntersect(node.left, theKey);
  else if (theKey.getPosition() > node.theKey.getPosition())
    node.right = insertNodeInitialIntersect(node.right, theKey);
  // Equal theKeys not allowed
  else {
    console.log(theKey, "duplicate insertion");
    console.alert();
    return node;
  }
  /* 2. Update getHeight of this ancestor node */
  node.getHeight = 1 + getMax(getHeight(node.left), getHeight(node.right));

  /* 3. Get the balance factor of this ancestor
    node to check whether this node became
    Wunbalanced */
  let balance = getBalance(node);

  // If this node becomes unbalanced, then
  // there are 4 cases Left Left Case
  if (balance > 1 && theKey.getPosition() < node.left.theKey.getPosition())
    return rightRotate(node);

  // Right Right Case
  if (balance < -1 && theKey.getPosition() > node.right.theKey.getPosition())
    return leftRotate(node);

  // Left Right Case
  if (balance > 1 && theKey.getPosition() > node.left.theKey.getPosition()) {
    node.left = leftRotate(node.left);
    return rightRotate(node);
  }

  // Right Left Case
  if (balance < -1 && theKey.getPosition() < node.right.theKey.getPosition()) {
    node.right = rightRotate(node.right);
    return leftRotate(node);
  }

  /* return the (unchanged) node pointer */
  return node;
}

function insertNode(node, theKey, v_i, guard, other) {
  /* 1. Perform the normal BST rotation */
  if (node == null) return new Node(theKey);

  if (guard.lineSideToInsert(v_i, node.theKey, other) === "toward")
    node.left = insertNode(node.left, theKey, v_i, guard, other);
  else if (guard.lineSideToInsert(v_i, node.theKey, other) === "away")
    node.right = insertNode(node.right, theKey, v_i, guard, other);
  // Equal theKeys not allowed
  else {
    console.log("duplicate insertion");
    console.alert();
    return node;
  }
  /* 2. Update getHeight of this ancestor node */
  node.getHeight = 1 + getMax(getHeight(node.left), getHeight(node.right));

  /* 3. Get the balance factor of this ancestor
    node to check whether this node became
    Wunbalanced */
  let balance = getBalance(node);

  // If this node becomes unbalanced, then
  // there are 4 cases Left Left Case
  if (
    balance > 1 &&
    guard.lineSideToInsert(v_i, node.left.theKey, other) === "toward"
  )
    return rightRotate(node);

  // Right Right Case
  if (
    balance < -1 &&
    guard.lineSideToInsert(v_i, node.right.theKey, other) === "away"
  )
    return leftRotate(node);

  // Left Right Case
  if (
    balance > 1 &&
    guard.lineSideToInsert(v_i, node.left.theKey, other) === "away"
  ) {
    node.left = leftRotate(node.left);
    return rightRotate(node);
  }

  // Right Left Case
  if (
    balance < -1 &&
    guard.lineSideToInsert(v_i, node.right.theKey, other) === "toward"
  ) {
    node.right = rightRotate(node.right);
    return leftRotate(node);
  }

  /* return the (unchanged) node pointer */
  return node;
}

/* Given a non-empty binary search tree, return the
node with minimum theKey value found in that tree.
Note that the entire tree does not need to be
searched. */
function minValueNode(node) {
  let current = node;

  /* loop down to find the leftmost leaf */
  while (current.left != null) current = current.left;

  return current;
}

function deleteNode(theRoot, theKey, v_i, guard, other) {
  // STEP 1: PERFORM STANDARD BST DELETE
  if (theRoot === null) return theRoot;

  // If the theKey to be deleted is smaller than
  // the theRoot's theKey, then it lies in left subtree
  if (guard.lineSideToDelete(v_i, theRoot.theKey, other, theKey) === "toward")
    theRoot.left = deleteNode(theRoot.left, theKey, v_i, guard, other);
  // If the theKey to be deleted is greater than the
  // theRoot's theKey, then it lies in right subtree
  else if (
    guard.lineSideToDelete(v_i, theRoot.theKey, other, theKey) === "away"
  )
    theRoot.right = deleteNode(theRoot.right, theKey, v_i, guard, other);
  // if theKey is same as theRoot's theKey, then this is the node
  // to be deleted
  else {
    let prev = theKey;
    theKey = guard.lineSideToDelete(v_i, theRoot.theKey, other, theKey);
    if (theKey === prev) {
    } else {
      deletehelper = true;
    }
    // node with only one child or no child
    if (theRoot.left === null || theRoot.right === null) {
      let temp = null;
      if (temp === theRoot.left) temp = theRoot.right;
      else temp = theRoot.left;

      // No child case
      if (temp === null) {
        temp = theRoot;
        theRoot = null;
      } // One child case
      else theRoot = temp; // Copy the contents of
      // the non-empty child
    } else {
      // node with two children: Get the inorder
      // successor (smallest in the right subtree)
      let temp = minValueNode(theRoot.right);

      // Copy the inorder successor's data to this node
      theRoot.theKey = temp.theKey;

      // Delete the inorder successor
      theRoot.right = deleteNode(theRoot.right, temp.theKey, v_i, guard, other);
    }
  }

  // If the tree had only one node then return
  if (theRoot === null) return theRoot;

  // STEP 2: UPDATE getHeight OF THE CURRENT NODE
  theRoot.getHeight =
    getMax(getHeight(theRoot.left), getHeight(theRoot.right)) + 1;

  // STEP 3: GET THE BALANCE FACTOR OF THIS NODE (to check whether
  // this node became unbalanced)
  let balance = getBalance(theRoot);

  // If this node becomes unbalanced, then there are 4 cases
  // Left Left Case
  if (balance > 1 && getBalance(theRoot.left) >= 0) return rightRotate(theRoot);

  // Left Right Case
  if (balance > 1 && getBalance(theRoot.left) < 0) {
    theRoot.left = leftRotate(theRoot.left);
    return rightRotate(theRoot);
  }

  // Right Right Case
  if (balance < -1 && getBalance(theRoot.right) <= 0)
    return leftRotate(theRoot);

  // Right Left Case
  if (balance < -1 && getBalance(theRoot.right) > 0) {
    theRoot.right = rightRotate(theRoot.right);
    return leftRotate(theRoot);
  }

  return theRoot;
}

// A utility function to print preorder traversal of
// the tree. The function also prints getHeight of every
// node
function preOrder(node) {
  if (node != null) {
    console.log(node.theKey.getPoint1(), node.theKey.getPoint2(), " ");
    preOrder(node.left);
    preOrder(node.right);
  }
}

function searchAVLForNode(root, key, override, v_i, guard) {
  // Base Cases: root is null
  // or key is present at root
  if (root === null || root.theKey === key) {
    if (root === null && override === false) {
      console.log("Big error 2!");
    }
    return root;
  }

  // Key is greater than root's key
  if (guard.lineSideToSearch(v_i, root.theKey) === "away") {
    return searchAVLForNode(root.right, key, override, v_i, guard);
  }
  // Key is smaller than root's key
  return searchAVLForNode(root.left, key, override, v_i, guard);
}
