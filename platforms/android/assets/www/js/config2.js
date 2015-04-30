var bluetoothle;

var jqmReady = $.Deferred();
var pgReady = $.Deferred();

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}


var app =
{
  callback: null,
  initialize: function(callback)
  {
    this.callback = callback;

    //If testing on a desktop, automatically resolve PhoneGap
    if (document.URL.match(/^https?:/) || document.URL.match(/^file:/))
    {
      pgReady.resolve();
    }
    //Else if on a mobile device, add event listener for deviceready
    else
    {
      document.addEventListener("device", onDeviceReady, false);
    }
  }
};

$(document).on("pagecreate", function()
{
  //Resolve jQuery Mobile
  jqmReady.resolve();
  $(document).off("pagecreate");
});

$.when(jqmReady, pgReady).then(function()
{
  //When PhoneGap and jQuery Mobile are resolved, start the app
  if (app.callback !== null)
  {
    app.callback();
  }
});

function onDeviceReady()
{
  //Resolve PhoneGap after deviceready has fired
  pgReady.resolve();
}

app.initialize(function()
{
  $("a.finish").on("vclick", finish);
});

function finish()
{
  var opAttr = $('#sex :selected').val() + $('#height :selected').val() + $('#weight :selected').val() + $('#salary :selected').val();
  var deviceAddr = localStorage.getItem("deviceAddr");
  var paramsObj = {address:deviceAddr};
  write(deviceAddr, "ffe0", "ffe1", btoa("OPATTR:" + opAttr + "   \n"));
  sleep(500);
  window.location.assign("index.html");
}

function write(address, serviceUuid, characteristicUuid, value)
{
  var paramsObj = {address:address, serviceUuid:serviceUuid, characteristicUuid:characteristicUuid, value:value};

  console.log("Write : " + JSON.stringify(paramsObj));

  bluetoothle.write(writeSuccess, writeError, paramsObj);

  sleep(2000);

  return false;
}

function writeSuccess(obj)
{
  console.log("Write Success : " + JSON.stringify(obj));

  if (obj.status == "written")
  {
    console.log("Write Success : " + JSON.stringify(obj));
    console.log("Written");
  }
  else
  {
    console.log("Write Unexpected : " + JSON.stringify(obj));
    console.log("Unexpected Write Status");
  }
}

function writeError(obj)
{
  console.log("Write Error : " + JSON.stringify(obj));
}
