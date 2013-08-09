this["WMP"] = this["WMP"] || {};
this["WMP"]["templates"] = this["WMP"]["templates"] || {};

this["WMP"]["templates"]["stats"] = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<section class="stats"><ul><li>' + escape((interp = popcornMakes) == null ? '' : interp) + ' Popcorn Makes</li><li>' + escape((interp = thimbleMakes) == null ? '' : interp) + ' Thimble Makes</li></ul></section>');
}
return buf.join("");
};

this["WMP"]["templates"]["header"] = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<header><h1>' + escape((interp = name) == null ? '' : interp) + '</h1></header>');
}
return buf.join("");
};