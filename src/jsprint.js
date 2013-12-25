function jsprint(arg) {
    if ( !jsprint.element ) {
        jsprint.init();
    }

    // if we have multiple arguments, print each individually
    if ( arguments.length > 1 ) {
        for ( i = 0; i < arguments.length; i++ ) {
            jsprint(arguments[i]);
        }
        return;
    }

    var newItem = document.createElement("div");
    newItem.innerHTML = jsprint.template(jsprint.templates["item.html"], arg);
    newItem.className = "item";
    jsprint.element.appendChild(newItem);
}

jsprint.init = function () {
    var element = document.getElementById("jsprint-root");

    if ( !element ) {
        element = document.createElement("div");
        element.id = "jsprint-root";
        document.body.appendChild(element);
    }

    var style = document.createElement("style");
    style.innerHTML = jsprint.templates["style.css"];
    document.head.appendChild(style);

    element.addEventListener("click", function(e){
        var target = e.target;
        var parent = target.parentElement;
        var className = target.className;
        var dropdown, dropdownClasses;

        if (className.indexOf("dropdown") !== -1 || className.indexOf("label") !== -1) {
            dropdown = parent.children[0];
            dropdownClasses = dropdown.className.split(" ");
            if (dropdownClasses.indexOf("open") === -1) {
                dropdownClasses.push("open");
            }
            else {
                dropdownClasses.pop();
            }

            dropdown.className = dropdownClasses.join(" ");
        }
    });

    this.element = element;
};

jsprint.templateFor = function (data) {
    var templates = jsprint.templates;


    if ( ["number", "string", "boolean"].indexOf(typeof data) !== -1 || data == null || data !== data ) {
        return ["||this||", JSON.stringify(data)];
    }

    else if ( data && data.constructor && data.constructor.name === "Array" ) {
        return templates["array.html"];
    }

    else {
        return [
            "||each this object.html||", Object.keys(data).map(function (key) {
                return {
                    key: key,
                    value: data[key]
                }
            })]
    }
};

jsprint.whichAccent = function(data) {
    if (typeof data === "object" && data != null) {
        return jsprint.templates["dropdown.html"];
    }
    else {
        return jsprint.templates["star.html"];
    }
};

jsprint.getConstructor = function(data){
    if (data && typeof data === "object") {
        return data.constructor.name;
    }
    else {
        return JSON.stringify(data);
    }
};

jsprint.template = function (template, data) {
    return template.replace(/\|\|(.+?)\|\|/g, function (m, param) {
        var parts = param.split(" ");

        var getSubdata = function (name) {
            return name === "this" ? data : data[name];
        };


        var first = parts[0], second = parts[1], third = parts[2];

        if ( parts.length === 1 ) {
            return ("" + getSubdata(first)).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        switch ( first ) {
            case "each":
                return getSubdata(second).map(function (subdata) {
                    return jsprint.template(jsprint.templates[third], subdata);
                }).join("");
            case "template":
                return jsprint.template(jsprint.templates[second], getSubdata(third));
            case "fun":
                var fun = (data && data[second]) || jsprint[second];
                var result = fun(getSubdata(third), data);
                if ( result && result.constructor && result.constructor.name === "Array" ) {
                    return jsprint.template.apply(this, result);
                } else {
                    return jsprint.template.call(this, result, data);
                }
        }
    });
};
