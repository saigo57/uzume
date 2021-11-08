const $ = require('jquery');

class DraggalbeSplitBarData {
  startPageX: number = 0.0;
  startRightWidth: number = 0.0;
  startLeftWidth: number = 0.0;
  rightId: string = "";
  leftId: string = "";
}

var dragging = "";
var splitBarMemo: {[key: string]: DraggalbeSplitBarData} = {};

$(window).mouseup(function(e:any) {
  delete splitBarMemo[dragging];
  dragging = "";
});

$(window).mousemove(function(e:any) {
  if ( dragging.length > 0 ) {
    // dxを左側に足す
    var pageX = e.pageX;
    // 画面外チェック
    if ( pageX < 0 ) pageX = 0;

    var dx = pageX - splitBarMemo[dragging].startPageX;

    if ( dx > 0 ) {
      // 右への移動
      var sideBarMinWidth = 100;
      if ( splitBarMemo[dragging].startRightWidth - dx < sideBarMinWidth ) {
        dx = splitBarMemo[dragging].startRightWidth - sideBarMinWidth;
      }
    } else {
      // 左への移動
      dx = -dx;
      var mainMinWidth = 180;
      if ( splitBarMemo[dragging].startLeftWidth - dx < mainMinWidth ) {
        dx = splitBarMemo[dragging].startLeftWidth - mainMinWidth;
      }
      dx = -dx;
    }

    $(splitBarMemo[dragging].rightId).width((splitBarMemo[dragging].startRightWidth - dx) + 'px');
    $(splitBarMemo[dragging].leftId).width((splitBarMemo[dragging].startLeftWidth + dx) + 'px');
    return false;
  }
});

export default function(split_bar_id: string, left_id: string, right_id: string) {
  $(split_bar_id).mousedown(function(e:any) {
    splitBarMemo[split_bar_id] = new DraggalbeSplitBarData();
    dragging = split_bar_id;
    splitBarMemo[split_bar_id].startPageX = e.pageX;
    splitBarMemo[split_bar_id].startRightWidth = $(right_id).width();
    splitBarMemo[split_bar_id].startLeftWidth = $(left_id).width();
    splitBarMemo[split_bar_id].rightId = right_id;
    splitBarMemo[split_bar_id].leftId = left_id;
  });
}
