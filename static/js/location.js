import {logger} from "./logger";

import {Dropdown} from "./dropdown";

/**
 * Location base class
 */

// settings are exported as default
const settings = {
    locations: {},
    translation_table: {},
};
export default settings;

export class Point {

    constructor(parameters) {
        const properties = Object.assign({...Point.default}, parameters);

        this.latitude = properties.latitude;
        this.longitude = properties.longitude;
        this.srid = properties.srid;
    }

}

Point.default = {
    latitude: 32.5149,
    longitude: -117.0382,
    srid: 4326
};

class ChoiceAddress {

    constructor(parameters) {

        const properties = Object.assign({...ChoiceAddress.default}, parameters);

        this.type = properties.type;
        this.location = properties.location;
        this.onClick = properties.onClick;

        this.dropdown = null;
    }

    select(key, force = false) {

        if (!force && this.location !== 'undefined' && this.location.id === key)
            // no changes, quick return
            return;

        // setting location
        this.location = settings.locations[this.type][key];

        // call onSelect
        this.onClick(key);
    }

    render(label, classes = "") {

        // language=HTML
        let html = `<div class="my-0 py-0 ${classes}" id="${label}-address-div">
    <p>`;

        // dropdown
        let options = {};
        if (settings.locations.hasOwnProperty(this.type)) {
            for (const [id, location] of Object.entries(settings.locations[this.type]))
                options[id] = location.name;
        }

        this.dropdown = new Dropdown({
            options: options,
            prefix: `address-${label}`,
            onClick: (value) => {
                this.select(value);
            }
        });

        html += `<div class="my-0 py-0 ${classes}" id="${label}-address-div">
    <p>`;

        html += this.dropdown.render("float-right");

        html += `</p>
</div>`;

        return html;
    }

    postRender(label) {

        if (this.dropdown !== null)
            this.dropdown.postRender();

        // initial select type
        if (this.location !== undefined)
            this.select(label, this.location.id, true);

    }

}

ChoiceAddress.default = {
    type: '',
    location: undefined,
    onClick: (key) => { logger.log('debug', 'key = %s', key)}
};

class SimpleAddress {

    constructor(location) {
        this.location = location;
    }

    render(label, classes = "") {

        // language=HTML
        return `<div class="my-0 py-0 ${classes}" id="${label}-address-div">
    <p>
        <em>${settings.translation_table['Address']}:</em>
    </p>
    <p>
        ${this.location.toText()}
    </p>
</div>`;

    }

    postRender() {

    }

}

export class Location {

    constructor(parameters) {

        const properties = Object.assign({...Location.default}, parameters);

        this.id = properties.id;
        this.name = properties.name;
        this.type = properties.type;
        this.number = properties.number;
        this.street = properties.street;
        this.unit = properties.unit;
        this.neighborhood = properties.neighborhood;
        this.city = properties.city;
        this.state = properties.state;
        this.zipcode = properties.zipcode;
        this.country = properties.country;
        this.location = new Point(properties.location);

        this.typeDropdown = null;
        this.addressComponent = null;

    }

    toText() {

        // format address
        let address = [this.number, this.street, this.unit].join(' ').trim();

        if (address !== "") {
            if (this.neighborhood !== "")
                address = [address, this.neighborhood].join(', ').trim();
        } else
            address += this.neighborhood.trim()

        if (address !== "")
            address = [address, this.city, this.state].join(', ').trim();
        else
            address = [this.city, this.state].join(', ').trim();

        address = [address, this.zipcode].join(' ').trim();
        address = [address, this.country].join(', ').trim();

        return address;
    }

    selectType(label, type, force = false) {

        if (!force && this.type === type)
            // no changes, quick return
            return;

        // setting type
        this.type = type;

        // reinitialize address component
        if (type === 'b' || type === 'o')
            this.addressComponent = new ChoiceAddress({
                    type: type,
                    onClick: (key) => {
                        logger.log('debug', 'Setting location to %s', key);
                        this.location = settings.locations[this.type][key];
                    }
                });
        else
            this.addressComponent = new SimpleAddress(this);

        $(`#location-${label}-item-address`)
            .empty()
            .append(
                this.addressComponent.render(`location-${label}`)
            );

        this.addressComponent.postRender();

    }

    render(label, classes = "", options = ['address-div']) {

        let html = '';

        // type
        this.typeDropdown = new Dropdown({
            options: location_type,
            value: this.type,
            prefix: `location-${label}`,
            onClick: (value) => {
                this.selectType(label, value);
            }
        });

        html += `<li id="location-${label}-item-type" class="${classes}">
    <em>${settings.translation_table['Type']}:</em>`;

        html += this.typeDropdown.render("float-right");

        html += '</li>';

        // address
        html += `<li id="location-${label}-item-address" class="${classes}">`;

        html += '</li>';

        return html;
    }

    postRender(label, options = ['address-div']) {

        if (this.typeDropdown !== null)
            this.typeDropdown.postRender();

        // initial select type
        this.selectType(label, this.type, true);

    }
    
}

Location.default = {
    id: null,
    name: '',
    type: 'w',
    number: '',
    street: '',
    unit: '',
    neighborhood: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    location: new Point()
};

