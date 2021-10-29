const cols = [];
const cards = [];

function Draggable() {
    this.isDragging = false;
    this.canDrag = true;
    this.originX = this.originY = this.currentX = this.currentY = 0;
}
Draggable.prototype.setIsDragging = function(isDragging) {
    this.isDragging = isDragging;
};
Draggable.prototype.getIsDragging = function() {
    return this.isDragging;
};
Draggable.prototype.setOrigin = function(x, y) {
    this.originX = x;
    this.originY = y;
};
Draggable.prototype.getOrigin = function() {
    return { x: this.originX, y: this.originY };
};

Draggable.prototype.setMoveOrigin = function(x, y) {
    this.moveOriginX = x;
    this.moveOriginY = y;
};
Draggable.prototype.getMoveOrigin = function() {
    return { x: this.moveOriginX, y: this.moveOriginY };
};

Draggable.prototype.setCurrent = function(x, y) {
    this.currentX = x;
    this.currentY = y;
};
Draggable.prototype.getCurrent = function() {
    return { x: this.currentX, y: this.currentY };
};

function inherit(subCtor, topCtor) {
    const proto = Object.create(topCtor.prototype);
    proto.constructor = subCtor;
    subCtor.prototype = proto;
}

const WIDTH = 150,
    HEIGHT = 300;

function Column({ top, left, width, height, attr } = {}) {
    Draggable.call(this);
    let elm;
    this.elm = elm = document.createElement("div");
    elm.className = "column";
    this.width = width;
    this.height = height;
    if (attr) {
        for (let key in attr) {
            elm.setAttribute(key, attr[key]);
        }
    }
    this.setOrigin(left, top);
    this.setMoveOrigin(0, 0);
    this.setCurrent(0, 0);
    this.render();
    this.initEvtListener();
}
inherit(Column, Draggable);
Column.prototype.getTopLeft = function() {
    const { x: originX, y: originY } = this.getOrigin();
    const { x: currentX, y: currentY } = this.getCurrent();
    const { x: moveOriginX, y: moveOriginY } = this.getMoveOrigin();
    // console.log({
    //     originX,
    //     originY,
    //     currentX,
    //     currentY,
    //     moveOriginX,
    //     moveOriginY,
    // });
    const top = Math.max(0, currentY - moveOriginY + originY),
        left = Math.max(0, currentX - moveOriginX + originX)
    return {
        top,
        left
    };
};
Column.prototype.render = function() {
    const { elm, width, height } = this;
    const { top, left } = this.getTopLeft();
    const con = elm.parentNode ? elm.parentNode : document.body;
    try {
        con.removeChild(elm);
    } catch (err) {
        err;
    }
    elm.style.width = width + "px";
    elm.style.height = height + "px";
    elm.style.top = top + "px";
    elm.style.left = left + "px";
    con.appendChild(elm);
};
Column.prototype.initEvtListener = function() {
    const { elm } = this;
    const cb = {
        touchstart(e) {
            const {
                touches: [{ pageX, pageY }],
            } = e;
            this.setMoveOrigin(pageX, pageY);
            this.setIsDragging(true);
        },
        touchmove(e) {
            if (!this.getIsDragging()) return;
            const {
                touches: [{ pageX, pageY }],
            } = e;
            this.setCurrent(pageX, pageY);
            this.render();
        },
        touchend(e) {
            this.setIsDragging(false);
            const { top, left } = this.getTopLeft();
            this.setOrigin(left, top);
        },
    };
    ["touchstart", "touchmove", "touchend"].forEach((evt) => {
        elm.addEventListener(evt, cb[evt].bind(this));
    });
};

function addCol() {
    const rowCount = ~~(document.documentElement.clientWidth / 200);

    cols.push(
        new Column({
            top: ~~(cols.length / rowCount) * HEIGHT + 100, // 100 for button
            left: (cols.length % rowCount) * WIDTH,
            width: WIDTH,
            height: HEIGHT,
            attr: {
                contenteditable: true,
            },
        })
    );
}