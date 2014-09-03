function doSomething (callback) {
    var value = 42;
    callback(value)
}

doSomething(function (value) {
    console.log('Got a value: ' + value);
});