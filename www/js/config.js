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
  $("a.scan").on("vclick", scan);
  $("a.next").on("vclick", next);

  $(document).on("vclick", "a.login", function()
  {
    login();

    return false;
  });
});

function scan()
{
  initialize();
  startScan();
}

function next()
{
  var myName = $('#name').val();
  var myAttr = $('#sex :selected').val() + $('#height :selected').val() + $('#weight :selected').val() + $('#salary :selected').val();
  var deviceAddr = $('#device :selected').val();
  var paramsObj = {address:deviceAddr};
  bluetoothle.connect(connectSuccess, connectError, paramsObj);
  sleep(1000);
  discover(deviceAddr);
  services(deviceAddr);
  sleep(1000);
  characteristics(deviceAddr, "ffe0");
  sleep(1000);
  write(deviceAddr, "ffe0", "ffe1", btoa("MYNAME:" + myName + "   \n"));
  sleep(1000);
  write(deviceAddr, "ffe0", "ffe1", btoa("MYATTR:" + myAttr + "   \n"));
  sleep(1000);
  localStorage.setItem("deviceAddr", deviceAddr);
  window.location.assign("config2.html");
  return false;
}

function initialize()
{
  var paramsObj = {request:true};

  console.log("Initialize : " + JSON.stringify(paramsObj));

  bluetoothle.initialize(initializeSuccess, initializeError, paramsObj);

  return false;
}

function initializeSuccess(obj)
{
  console.log("Initialize Success : " + JSON.stringify(obj));

  if (obj.status == "enabled")
  {
    console.log("Enabled");
  }
  else
  {
    console.log("Unexpected Initialize Status");
  }
}

function initializeError(obj)
{
  console.log("Initialize Error : " + JSON.stringify(obj));
}

function startScan()
{
  var paramsObj = {serviceUuids:[]};

  console.log("Start Scan : " + JSON.stringify(paramsObj));

  bluetoothle.startScan(startScanSuccess, startScanError, paramsObj);

  return false;
}

function startScanSuccess(obj)
{
  console.log("Start Scan Success : " + JSON.stringify(obj));

  if (obj.status == "scanResult")
  {
    console.log("Scan Result");

    addDevice(obj.address, obj.name);
  }
  else if (obj.status == "scanStarted")
  {
    console.log("Scan Started");
  }
  else
  {
    console.log("Unexpected Start Scan Status");
  }
}

function startScanError(obj)
{
  console.log("Start Scan Error : " + JSON.stringify(obj));
}

function connect(address)
{
  var paramsObj = {address:address};

  console.log("Connect : " + JSON.stringify(paramsObj));
  bluetoothle.connect(connectSuccess, connectError, paramsObj);

  return false;
}

function connectSuccess(obj)
{
  console.log("Connect Success : " + JSON.stringify(obj));

  if (obj.status == "connected")
  {
    console.log("Connected");
  }
  else if (obj.status == "connecting")
  {
    console.log("Connecting");
  }
  else
  {
    console.log("Unexpected Connect Status");
  }
}

function connectError(obj)
{
  console.log("Connect Error : " + JSON.stringify(obj));
}

function reconnect(address)
{
  var paramsObj = {address:address};

  console.log("Reconnect : " + JSON.stringify(paramsObj));

  bluetoothle.reconnect(reconnectSuccess, reconnectError, paramsObj);

  return false;
}

function discover(address)
{
  var paramsObj = {address:address};

  console.log("Discover : " + JSON.stringify(paramsObj));

  bluetoothle.discover(discoverSuccess, discoverError, paramsObj);

  return false;
}

function discoverSuccess(obj)
{
  console.log("Discover Success : " + JSON.stringify(obj));

  if (obj.status == "discovered")
  {
    console.log("Discovered");

    var address = obj.address;

    var services = obj.services;

    for (var i = 0; i < services.length; i++)
    {
      var service = services[i];

      addService(address, service.serviceUuid);

      var characteristics = service.characteristics;

      for (var j = 0; j < characteristics.length; j++)
      {
        var characteristic = characteristics[j];

        addCharacteristic(address, service.serviceUuid, characteristic.characteristicUuid);

        var descriptors = characteristic.descriptors;

        for (var k = 0; k < descriptors.length; k++)
        {
          var descriptor = descriptors[k];

          addDescriptor(address, service.serviceUuid, characteristic.characteristicUuid, descriptor.descriptorUuid);
        }
      }
    }
  }
  else
  {
    console.log("Unexpected Discover Status");
  }
}

function discoverError(obj)
{
  console.log("Discover Error : " + JSON.stringify(obj));
}

function read(address, serviceUuid, characteristicUuid)
{
  var paramsObj = {address:address, serviceUuid:serviceUuid, characteristicUuid:characteristicUuid};

  alert("Read : " + JSON.stringify(paramsObj));

  bluetoothle.read(readSuccess, readError, paramsObj);

  return false;
}

function readSuccess(obj)
{
  alert("Read Success : " + JSON.stringify(obj));

  if (obj.status == "read")
  {
    /*var bytes = bluetoothle.encodedStringToBytes(obj.value);
    console.log("Read : " + bytes[0]);*/
    alert("Read Success : " + JSON.stringify(obj));

    console.log("Read");
  }
  else
  {
    alert("Unexpected Read Status");
  }
}

function readError(obj)
{
  alert("Read Error : " + JSON.stringify(obj));
}

function services(address)
{
  var paramsObj = {address:address, serviceUuids:[]};

  console.log("Services : " + JSON.stringify(paramsObj));

  bluetoothle.services(servicesSuccess, servicesError, paramsObj);

  return false;
}

function servicesSuccess(obj)
{
  console.log("Services Success : " + JSON.stringify(obj));

  if (obj.status == "services")
  {
    console.log("Services");

    var serviceUuids = obj.serviceUuids;

    for (var i = 0; i < serviceUuids.length; i++)
    {
      addService(obj.address, serviceUuids[i]);
    }
  }
  else
  {
    console.log("Unexpected Services Status");
  }
}

function servicesError(obj)
{
  console.log("Services Error : " + JSON.stringify(obj));
}

function rssi(address)
{
  var paramsObj = {address:address};

  console.log("RSSI : " + JSON.stringify(paramsObj));

  bluetoothle.rssi(rssiSuccess, rssiError, paramsObj);

  return false;
}

function subscribe(address, serviceUuid, characteristicUuid)
{
  var paramsObj = {address:address, serviceUuid:serviceUuid, characteristicUuid:characteristicUuid};

  console.log("Subscribe : " + JSON.stringify(paramsObj));

  bluetoothle.subscribe(subscribeSuccess, subscribeError, paramsObj);

  return false;
}

function write(address, serviceUuid, characteristicUuid, value)
{
  var paramsObj = {address:address, serviceUuid:serviceUuid, characteristicUuid:characteristicUuid, value:value};

  console.log("Write : " + JSON.stringify(paramsObj));

  bluetoothle.write(writeSuccess, writeError, paramsObj);

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

function readDescriptor(address, serviceUuid, characteristicUuid, descriptorUuid)
{
  var paramsObj = {address:address, serviceUuid:serviceUuid, characteristicUuid:characteristicUuid, descriptorUuid:descriptorUuid};

  console.log("Read Descriptor : " + JSON.stringify(paramsObj));

  bluetoothle.readDescriptor(readDescriptorSuccess, readDescriptorError, paramsObj);

  return false;
}

function characteristics(address, serviceUuid)
{
  var paramsObj = {address:address, serviceUuid:serviceUuid, characteristicUuids:[]};

  console.log("Characteristics : " + JSON.stringify(paramsObj));

  bluetoothle.characteristics(characteristicsSuccess, characteristicsError, paramsObj);

  return false;
}

function characteristicsSuccess(obj)
{
  console.log("Characteristics Success : " + JSON.stringify(obj));

  if (obj.status == "characteristics")
  {
    console.log("Characteristics");

    var characteristics = obj.characteristics;

    for (var i = 0; i < characteristics.length; i++)
    {
      addCharacteristic(obj.address, obj.serviceUuid, characteristics[i].characteristicUuid);
    }
  }
  else
  {
    console.log("Unexpected Characteristics Status");
  }
}

function characteristicsError(obj)
{
  console.log("Characteristics Error : " + JSON.stringify(obj));
}

function addDevice(address, name)
{
  $("#device").append($("<option></option>").attr("value", address).text(name));
}
