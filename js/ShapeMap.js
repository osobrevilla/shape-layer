(function ($, doc) {
    'user strict';
    if (typeof Object.create !== 'function') {
        Object.create = function (o) {
            function F() {}
            F.prototype = o;
            return new F();
        };
    }
    ShapeMap = function (el, options) {
        var that = this,
            wHCursor = 10;
        this.el = $(el);
        this.pointStart = {};
        this.pressed = false;
        this.tmpArea = null;
        this.areas = [];
        this.options = $.extend({
            maxWith: this.el.width(),
            maxHeight: this.el.height(),
            minHeight: 1,
            minWidth: 1,
            shape: 'rect' // rect/circle/poly
        }, options);
        this.el
            .css('position', 'relative')
            .on('mousedown', function (e) {
                if (e.button != 0 || e.target != this)
                    return false;
                e.originalEvent.preventDefault();
                that.pressed = true;
                that.drawArea({
                    x: e.pageX,
                    y: e.pageY
                });
                that.el
                    .on('mouseup', function (e) {
                        that.pressed = false;
                        if (that.tmpArea)
                            that.addArea(that.tmpArea);
                        that.tmpArea = null;
                        that.el.off('mouseup, mousemove');
                    })
                    .on('mousemove', function (e) {
                        if (that.pressed) {
                            that.tmpArea.resize({
                                width: (e.pageX - that.pointStart.x) - wHCursor,
                                height: (e.pageY - that.pointStart.y) - wHCursor,
                                x: that.pointStart.x,
                                y: that.pointStart.y
                            });
                        }
                    })
            });
    };
    ShapeMap.prototype = {
        constructor: ShapeMap,
        drawArea: function (point) {
            $.extend(this.pointStart, point);
            this.tmpArea = this.buildArea(this.options.shape, this.pointStart);
            this.tmpArea.el.appendTo(this.el);
        },
        buildArea: function (shape, point) {
            var area;
            switch (shape) {
            case 'rect':
            default:
                area = new Rect(this.pointStart);
                break;
            case 'circle':
                area = new Circle(this.pointStart);
                break;
            }
            return area;
        },
        addArea: function (area) {
            this.areas.push(area);
            if (this.options.onCreateArea)
                this.options.onCreateArea.call(this, area);
            return this.areas.lenght;
        },
        deleteArea: function (area) {
            var p;
            for (p in this.areas) {
                if (this.areas[p] === area) {
                    this.areas[p].destroy();
                    delete(this.areas[p]);
                    return true;
                }
            }
            return false;
        }
    };

    /*  
     * Base Area
     */

    Area = function (point, options) {
        var that = this;
        this.point = {};
        this.point.x = point.x;
        this.point.y = point.y;
        this.point.width = point.width;
        this.point.height = point.height;
        if (point.radius)
            this.point.radius = point.radius;
        this.options = $.extend({}, options);
        this.pressed = false;
        this.el = $('<div class="ui-area" />')
            .css('position', 'absolute').css(this._tdc(this.point))
    };

    Area.prototype = {
        constructor: Area,
        destroy: function () {
            this.el.remove();
            this.el.off();
            this.el = null;
        },
        _tdc: function (coords) {
            var out = $.extend({}, coords);
            out.left = out.x;
            out.top = out.y;
            delete out.y;
            delete out.x;
            return out;
        },
        resize: function (point) {
            this.point = $.extend(this.point, point);
            this.el.css(this._tdc(this.point));
        }
    };

    /*  
     * Rect Area
     */

    Rect = function (point) {
        var that = this;
        Area.apply(this, arguments);
        this.el.addClass('ui-area-rect');
    };
    Rect.prototype = Object.create(Area.prototype);
    Rect.prototype.constructor = Rect;

    /*  
     * Link Area
     */

    LinkArea = function (point, options) {
        var that = this;
        Area.apply(this, arguments);
        this.shape = 'rect';
        this.el.addClass('ui-area-rect ui-area-link');
    };

    LinkArea.prototype = Object.create(Area.prototype);
    LinkArea.prototype.constructor = LinkArea;

    $.extend(LinkArea.prototype, {
        init: function () {
            var that = this;
            var btnEdit = $('<button/>')
                .addClass('ui-area-button ui-area-button-edit')
                .on('click', function () {
                    if (that.options.onEdit)
                        that.options.onEdit.call(that);
                }).appendTo(this.el);
            var btnDel = $('<button/>')
                .addClass('ui-area-button ui-area-button-del')
                .on('click', function () {
                    if (that.options.onDelete)
                        that.options.onDelete.call(that);
                }).appendTo(this.el);
        }
    });

    /*  
     * SetUp jQuery Plugin
     */

    $.fn.ShapeMap = function (options) {
        return this.each(function () {
            var el = $(this),
                api = el.data('api');
            if (api)
                return api;
            el.data('api', new ShapeMap(this, options));
        });
    };
}(window.jQuery, window.document));
