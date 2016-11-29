///<reference path="../../headers/common.d.ts" />

import _ from 'lodash';
import moment from 'moment';
import * as dateMath from './datemath';

var spans = {
  's': {display: '秒'},
  'm': {display: '分钟'},
  'h': {display: '小时'},
  'd': {display: '天'},
  'w': {display: '周'},
  'M': {display: '月'},
  'y': {display: '年'},
};

var rangeOptions = [
  { from: 'now/d',    to: 'now/d',    display: '今天',                 section: 2 },
  { from: 'now/d',    to: 'now',      display: '今天(到现在)',          section: 2 },
  { from: 'now/w',    to: 'now/w',    display: '本周',                  section: 2 },
  { from: 'now/w',    to: 'now',      display: '本周(到现在)',           section: 2 },
  { from: 'now/M',    to: 'now/M',    display: '本月',            section: 2 },
  { from: 'now/y',    to: 'now/y',    display: '今年',             section: 2 },

  { from: 'now-1d/d', to: 'now-1d/d', display: '昨天',             section: 1 },
  { from: 'now-2d/d', to: 'now-2d/d', display: '前天',  section: 1 },
  { from: 'now-7d/d', to: 'now-7d/d', display: '上周的今天',    section: 1 },
  { from: 'now-1w/w', to: 'now-1w/w', display: '上周',         section: 1 },
  { from: 'now-1M/M', to: 'now-1M/M', display: '上个月',        section: 1 },
  { from: 'now-1y/y', to: 'now-1y/y', display: '去年',         section: 1 },

  { from: 'now-5m',   to: 'now',      display: '前5分钟',        section: 3 },
  { from: 'now-15m',  to: 'now',      display: '前15分钟',       section: 3 },
  { from: 'now-30m',  to: 'now',      display: '前30分钟',       section: 3 },
  { from: 'now-1h',   to: 'now',      display: '前1小时',           section: 3 },
  { from: 'now-3h',   to: 'now',      display: '前3小时',          section: 3 },
  { from: 'now-6h',   to: 'now',      display: '前6小时',          section: 3 },
  { from: 'now-12h',  to: 'now',      display: '前12小时',         section: 3 },
  { from: 'now-24h',  to: 'now',      display: '前24小时',         section: 3 },

  { from: 'now-7d',   to: 'now',      display: '前7天',           section: 0 },
  { from: 'now-30d',  to: 'now',      display: '前30天',          section: 0 },
  { from: 'now-60d',  to: 'now',      display: '前60天',          section: 0 },
  { from: 'now-90d',  to: 'now',      display: '前90天',          section: 0 },
  { from: 'now-6M',   to: 'now',      display: '前6个月',         section: 0 },
  { from: 'now-1y',   to: 'now',      display: '前1年',           section: 0 },
//  { from: 'now-2y',   to: 'now',      display: '前2年',          section: 0 },
//  { from: 'now-5y',   to: 'now',      display: '前5年',          section: 0 },
];

var absoluteFormat = 'MMM D, YYYY HH:mm:ss';

var rangeIndex = {};
_.each(rangeOptions, function (frame) {
  rangeIndex[frame.from + ' to ' + frame.to] = frame;
});

export  function getRelativeTimesList(timepickerSettings, currentDisplay) {
  var groups = _.groupBy(rangeOptions, (option: any) => {
    option.active = option.display === currentDisplay;
    return option.section;
  });

  // _.each(timepickerSettings.time_options, (duration: string) => {
  //   let info = describeTextRange(duration);
  //   if (info.section) {
  //     groups[info.section].push(info);
  //   }
  // });

  return groups;
}

function formatDate(date) {
  return date.format(absoluteFormat);
}

// handles expressions like
// 5m
// 5m to now/d
// now/d to now
// now/d
// if no to <expr> then to now is assumed
export function describeTextRange(expr: any) {
  if (expr.indexOf('now') === -1) {
    expr = 'now-' + expr;
  }

  let opt = rangeIndex[expr + ' to now'];
  if (opt) {
    return opt;
  }

  opt = {from: expr, to: 'now'};

  let parts = /^now-(\d+)(\w)/.exec(expr);
  if (parts) {
    let unit = parts[2];
    let amount = parseInt(parts[1]);
    let span = spans[unit];
    if (span) {
      opt.display = '前 ' + amount + ' ' + span.display;
      opt.section = span.section;
      // if (amount > 1) {
      //   opt.display += 's';
      // }
    }
  } else {
    opt.display = opt.from + ' 到 ' + opt.to;
    opt.invalid = true;
  }

  return opt;
}

export function describeTimeRange(range) {
  var option = rangeIndex[range.from.toString() + ' to ' + range.to.toString()];
  if (option) {
    return option.display;
  }

  if (moment.isMoment(range.from) && moment.isMoment(range.to)) {
    return formatDate(range.from) + ' 到 ' + formatDate(range.to);
  }

  if (moment.isMoment(range.from)) {
    var toMoment = dateMath.parse(range.to, true);
    return formatDate(range.from) + ' 到 ' + toMoment.fromNow();
  }

  if (moment.isMoment(range.to)) {
    var from = dateMath.parse(range.from, false);
    return from.fromNow() + ' 到 ' + formatDate(range.to);
  }

  if (range.to.toString() === 'now') {
    var res = describeTextRange(range.from);
    return res.display;
  }

  return range.from.toString() + ' 到 ' + range.to.toString();
}

