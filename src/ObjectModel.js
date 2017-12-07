
export const version = () => "1.0.0";

/* TODO : Créer le modèle objet ici */ 

export class Data {}

export class TimeSeries extends Data {
    constructor(values, labels) {
        super();
        this._values = values;
        this._labels = labels;
    }
    
    get length() { return this._values.length; }

    get values() { return this._values; }
    set values(val) { this._values = val; }

    get labels() { return this._labels; }
    set labels(val) { this._labels = val; }

    curval() { return this._values[this._values.length-1]}

    valueByIndex(index) { return {value: this._values[index], label: this._labels[index]}; }
    valueByLabel(label) { return this.valueByIndex(this._labels.indexOf(label)); }

    average() {
        if(this._values.length < 1) return undefined;

        var sum = 0;
        this._values.forEach(function(element) {
            sum += parseFloat(element);
        });
        return sum / this._values.length;
    }

    timeInterval() {
        if(this._values.length < 2) return undefined;

        var interval = [];
        interval.push(this.valueByIndex(0).label, this.valueByIndex([this._values.length - 1]).label);

        return interval;
    }

    lastValue() {
        if(this._values.length < 1) return undefined;
        return this._data.valueByIndex(this._values.length - 1);
    }

    push(value, label) {
        this._values.push(value);
        this._labels.push(label);
    }
}

export class Datum extends Data {
    constructor(value) {
        super();
        this._value = value;
    }

    get value() { return this._value; }
    set value(val) { this._value = val; }

    curval() {return this._value; }
}

export class Sensor {
    constructor(id, name, data, type) {
      this._id = id;
      this._name = name;
      this._data = data;
      this._type = type;
    }
    get id() { return this._id; }
    set id(val) { this._id = val; }

    get name() { return this._name; }
    set name(val) { this._name = val; }

    get data() { return this._data; }
    set data(val) { this._data = val; }
}

export class Door extends Sensor {
    constructor(id, name, data) {
        super(id, name, data);
        this._type = "DOOR"; 
    }

    isopen() { return this._data.value === 1; }
    open() { this._data.value = 1; } 
    close() { this._data.value = 0; } 
    switch() { this.isopen() ? this.close() : this.open(); } 
}

export class Temperature extends Sensor {
    constructor(id, name, data) {
        super(id, name, data);
        this._type = "TEMPERATURE";
    }
}

export class FanSpeed extends Temperature {
    constructor(id, name, data) {
        super(id, name, data);
        this._type = "FAN_SPEED";
    }
}