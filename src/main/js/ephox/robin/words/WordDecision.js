define(
  'ephox.robin.words.WordDecision',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    var make = Struct.immutable('item', 'start', 'finish', 'text');
    var decision = Struct.immutable('items', 'abort');

    var detail = function (universe, item) {
      var text = universe.property().getText(item);
      return make(item, 0, text.length, text);
    };

    var onEdge = function (universe, item, slicer) {
      return decision([], true);
    };

    var onOther = function (universe, item, slicer) {
      return decision([], false);
    };

    // Returns: a 'decision' Struct with the items slot containing an empty array if None
    //   or  a zero-width [start, end] range was returned by slicer, or 1-element array of the
    //   [start, end] substring otherwise.
    var onText = function (universe, item, slicer) {
      var text = universe.property().getText(item);
      return slicer(text).fold(function () {
        return decision([ make(item, 0, text.length, text) ], false);
      }, function (splits) {
        var items = splits[0] === splits[1] ? [] : [ make(item, splits[0], splits[1], text.substring(splits[0], splits[1])) ];
        return decision(items, true);
      });
    };

    var decide = function (universe, item, slicer) {
      var f = (function () {
        if (universe.property().isBoundary(item)) return onEdge
        else if (universe.property().isEmptyTag(item)) return onEdge;
        else if (universe.property().isText(item)) return onText;
        else return onOther;
      })();
      return f(universe, item, slicer);
    };

    return {
      detail: detail,
      decide: decide
    };
  }
);