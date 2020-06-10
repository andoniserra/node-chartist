const capitalize = require('underscore.string/capitalize');
const co = require('co');
const renderAxisTitles = require('./axis-title');

/**
 * Generate Chart HTML
 * @param  {String} type
 *         bar, line, pie
 * @return {Promise{String}} html
 */
const generate = co.wrap(function * (Chartist, window, type, options, data) {
  type = capitalize(type);
  if (!Chartist[type]) throw new TypeError(`Unsupported chart type: ${type}`);
  const container = window.document.createElement('div');
  const chart = new Chartist[type](container, data, options);
  chart.on('draw', function(data) {
    if(data.type === 'bar') {
      data.element.attr({
        style: 'stroke-width: 15px;'
      });
    }
  });
  chart.on('created', function(context) {
    if(context.options.targetLines){
      context.options.targetLines.forEach((targetLine) => {
        var yLine = projectY(context.chartRect, context.bounds, targetLine.value);
        context.svg.elem('line', {
          x1: context.chartRect.x1,
          x2: context.chartRect.x2,
          y1: yLine,
          y2: yLine
        }, targetLine.class);

      })
    }
  });
  const event = yield new Promise(resolve => chart.on('created', resolve));
  chart.axisX = event.axisX;
  chart.axisY = event.axisY;
  renderAxisTitles(Chartist, chart);
  chart.detach();
  return container.innerHTML;
});

module.exports = generate;
