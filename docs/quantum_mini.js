var amps={
    0: [1.0, 0.0]
};
var max_bit = 0;
var commands = "";
function update_max_bit(n) {
    if (max_bit < n) {
        max_bit = n;
    }
}
function set_cmd0(text) {
    document.querySelector("#cmd0").value = text;
}
function set_cmd1(text) {
    document.querySelector("#cmd1").value = text;
}
function set_cmd2(text) {
    document.querySelector("#cmd2").value = text;
}
function get_cmd0() {
    return document.querySelector("#cmd0").value;
}
function get_cmd1() {
    return document.querySelector("#cmd1").value;
}
function get_cmd2() {
    return document.querySelector("#cmd2").value;
}
function set_arg0(a) {
    document.querySelector("#arg0").value = a;
}
function set_arg1(a) {
    document.querySelector("#arg1").value = a;
}
function set_arg2(a) {
    document.querySelector("#arg2").value = a;
}
function get_arg0() {
    return document.querySelector("#arg0").value;
}
function get_arg1() {
    return document.querySelector("#arg1").value;
}
function get_arg2(text) {
    return document.querySelector("#arg2").value;
}
var error_msg = "";
function set_error(msg) {
    error_msg = msg + "\n";
}
function clear_display() {
    var tbody = document.getElementById("display");
    for (var i = tbody.rows.length - 1; i >= 0; i--) {
        tbody.removeChild(tbody.rows[i]);
    }
}
function strOfFloat(f) {
    var r = f.toFixed(8);
    if (r.match(/\./)) {
        return r.replace(/\.?0+$/, "");
    }
    return r;
}
function disp() {
    if (error_msg) {
        document.querySelector("#message").value = error_msg;
    } else {
        document.querySelector("#message").value = commands;
    }
    clear_display();
    var tbody = document.getElementById("display");
    for(state in amps) {
        var tr = tbody.insertRow(tbody.rows.length);
        var amp = amps[state];
        var real = amp ? amp[0] : 0.0;
        var imag = amp ? amp[1] : 0.0;
        var td_real = tr.insertCell(0);
        td_real.appendChild(
            document.createTextNode(strOfFloat(real)));
        var td_imag = tr.insertCell(1);
        var td_state = tr.insertCell(2);
        td_state.appendChild(document.createTextNode(
            "|" + bits_of(state) + ">"));
        if (imag == 0.0) {
            continue;
        }
        if (imag == 1.0) {
            td_imag.appendChild(document.createTextNode("+i"));
        } else if (imag == -1.0) {
            td_imag.appendChild(document.createTextNode("-i"));
        } else {
            if (imag >= 0.0) {
                td_imag.appendChild(
                    document.createTextNode("+" + strOfFloat(imag) + "i"));
            } else {
                td_imag.appendChild(
                    document.createTextNode(strOfFloat(imag) + "i"));
            }
        }
    }
    error_msg = "";
}
function clear_cmd() {
    set_cmd0("");
    set_cmd1("");
    set_cmd2("");
    set_arg0("");
    set_arg1("");
    set_arg2("");
}
function reset_cmd() {
    amps = { 0:[1.0, 0.0] };
    max_bit = 0;
    messages = "";
    clear_cmd();
    disp();
}
function set_cmd(c) {
    if (get_cmd0() === "") {
        set_cmd0(c);
        return;
    }
    if (get_arg0() === "") {
        return;
    }
     if (get_cmd1() === "") {
        set_cmd1(c);
    }
    if (get_arg1() === "") {
        return;
    }
    if (get_cmd2() === "") {
        set_cmd2(c);
    }
}
function get_cmd() {
    var c = get_cmd2();
    if (c) {
        return c;
    }
    var c = get_cmd1();
    if (c) {
        return c;
    }
    var c = get_cmd0();
    if (c) {
        return c;
    }
    return "";
}
function get_arg() {
    var a = get_arg2();
    if (a) {
        return a;
    }
    a = get_arg1();
    if (a) {
        return a;
    }
    return get_arg0();
}
function set_arg(c) {
    if (get_cmd2()) {
        set_arg2(get_arg2() + c);
    } else if (get_cmd1()) {
        set_arg1(get_arg1() + c);
    } else if (get_cmd0()) {
        set_arg0(get_arg0() + c);
    }
}
function reset_arg(a) {
    if (get_cmd2()) {
        set_arg2(a);
    } else if (get_cmd1()) {
        set_arg1(a);
    } else if (get_cmd0()) {
        set_arg0(a);
    }
}
function set_arg_dot() {
    var c = get_cmd();
    if (c != "R") {
        return;
    }
    var a = get_arg();
    if (a.indexOf(":") === -1) {
        return;
    }
    set_arg(".");
}
function set_arg_negative() {
    var c = get_cmd();
    if (c != "R") {
        return;
    }
    var a = get_arg();
    if (a.indexOf(":") === -1) {
        return;
    }
    var nrs =a.split(":");
    var n = nrs[0];
    var r = -nrs[1];
    reset_arg(n+":"+r);
    if (max_bit < n) {
        max_bit = n;
    }
}
function is_1(state, n) {
    return (state & (1 << n)) != 0 ? true : false;
}
function set_1(state, n) {
    return state | (1 << n);
}
function set_0(state, n) {
    return state & ~(1 << n);
}
function bits_of(state) {
    var s = "";
    for (n = 0;n <= max_bit; n++) {
        s += is_1(state, n) ? "1" : "0";
    }
    return s;
}
function add(a, b) {
    return [a[0]+b[0], a[1]+b[1]];
}
function mult(a, b) {
    return [a[0]*b[0] -  a[1]*b[1], a[0]*b[1] +  a[1]*b[0]];
}
function m_add(m, state, a) {
    if (m[state]) {
        m[state] = add(m[state], a);
    } else {
        m[state] = a;
    }
}
function exec_h(n) {
    update_max_bit(n);
    var amps2 = {};
    var w = Math.sqrt(0.5);
    for(state in amps) {
        var a = amps[state];
        if (is_1(state, n)) {
            m_add(amps2, set_0(state, n), mult(a, [w, 0]));
            m_add(amps2, set_1(state, n), mult(a, [-w, 0]));
        } else {
            m_add(amps2, set_0(state, n), mult(a, [w, 0]));
            m_add(amps2, set_1(state, n), mult(a, [w, 0]));
        }
    }
    amps = amps2;
    commands = commands + " H["
        + n + "]";
}
function exec_ch(c, n) {
    update_max_bit(c);
    update_max_bit(n);
    var amps2 = {};
    var w = Math.sqrt(0.5);
    for(state in amps) {
        var a = amps[state];
        if (!is_1(state, c)) {
            m_add(amps2, state, a);
            continue;
        }
        if (is_1(state, n)) {
            m_add(amps2, set_0(state, n), mult(a, [w, 0]));
            m_add(amps2, set_1(state, n), mult(a, [-w, 0]));
        } else {
            m_add(amps2, set_0(state, n), mult(a, [w, 0]));
            m_add(amps2, set_1(state, n), mult(a, [w, 0]));
        }
    }
    amps = amps2;
    commands = commands + " CH["
        + c + "," + n + "]";
}
function exec_cch(c1, c2, n) {
    update_max_bit(c1);
    update_max_bit(c2);
    update_max_bit(n);
    var amps2 = {};
    var w = Math.sqrt(0.5);
    for(state in amps) {
        var a = amps[state];
        if (!is_1(state, c1)) {
            m_add(amps2, state, a);
            continue;
        }
        if (!is_1(state, c2)) {
            m_add(amps2, state, a);
            continue;
        }
        if (is_1(state, n)) {
            m_add(amps2, set_0(state, n), mult(a, [w, 0]));
            m_add(amps2, set_1(state, n), mult(a, [-w, 0]));
        } else {
            m_add(amps2, set_0(state, n), mult(a, [w, 0]));
            m_add(amps2, set_1(state, n), mult(a, [w, 0]));
        }
    }
    amps = amps2;
    commands = commands + " CCH["
        + c1 + "," + c2 + "," + n + "]";
}
function exec_x(n) {
    update_max_bit(n);
    var amps2 = {};
    for(state in amps) {
        var a = amps[state];
        var state2 = is_1(state, n) ?set_0(state, n) : set_1(state, n);
        m_add(amps2, state2, a);
    }
    amps = amps2;
    commands = commands + " X["
        + n + "]";
}
function exec_cx(c, n) {
    update_max_bit(c);
    update_max_bit(n);
    var amps2 = {};
    for(state in amps) {
        var a = amps[state];
        if (!is_1(state, c)) {
            m_add(amps2, state, a);
            continue;
        }
        var state2 = is_1(state, n) ?set_0(state, n) : set_1(state, n);
        m_add(amps2, state2, a);
    }
    amps = amps2;
    commands = commands + " CX["
        + c + "," + n + "]";
}
function exec_ccx(c1, c2, n) {
    update_max_bit(c1);
    update_max_bit(c2);
    update_max_bit(n);
    var amps2 = {};
    for(state in amps) {
        var a = amps[state];
        if (!is_1(state, c1)) {
            m_add(amps2, state, a);
            continue;
        }
        if (!is_1(state, c2)) {
            m_add(amps2, state, a);
            continue;
        }
        var state2 = is_1(state, n) ?set_0(state, n) : set_1(state, n);
        m_add(amps2, state2, a);
    }
    amps = amps2;
    commands = commands + " CCX["
        + c1 + "," + c2 + "," + n + "]";
}
function exec_y(n) {
    update_max_bit(n);
    var amps2 = {};
    for(state in amps) {
        var a = amps[state];
        if (is_1(state, n)) {
            m_add(amps2, set_0(state, n), mult(a, [0, -1]));
        } else {
            m_add(amps2, set_1(state, n), mult(a, [0, 1]));
        }
    }
    amps = amps2;
    commands = commands + " Y["
        + n + "]";
}
function exec_cy(c, n) {
    update_max_bit(c);
    update_max_bit(n);
    var amps2 = {};
    for(state in amps) {
        var a = amps[state];
        if (!is_1(state, c)) {
            m_add(amps2, state, a);
            continue;
        }
        if (is_1(state, n)) {
            m_add(amps2, set_0(state, n), mult(a, [0, -1]));
        } else {
            m_add(amps2, set_1(state, n), mult(a, [0, 1]));
        }
    }
    amps = amps2;
    commands = commands + " CY["
        + c + "," + n + "]";
}
function exec_ccy(c1, c2, n) {
    update_max_bit(c1);
    update_max_bit(c2);
    update_max_bit(n);
    var amps2 = {};
    for(state in amps) {
        var a = amps[state];
        if (!is_1(state, c1)) {
            m_add(amps2, state, a);
            continue;
        }
        if (!is_1(state, c2)) {
            m_add(amps2, state, a);
            continue;
        }
        if (is_1(state, n)) {
            m_add(amps2, set_0(state, n), mult(a, [0, -1]));
        } else {
            m_add(amps2, set_1(state, n), mult(a, [0, 1]));
        }
    }
    amps = amps2;
    commands = commands + " CCY["
        + c1 + "," + c2 + "," + n + "]";
}
function exec_z(n) {
    update_max_bit(n);
    var amps2 = {};
    for(state in amps) {
        var a = amps[state];
        if (is_1(state, n)) {
            m_add(amps2, state, mult(a, [-1, 0]));
        } else {
            m_add(amps2, state, a);
        }
    }
    amps = amps2;
    commands = commands + " Z["
        + n + "]";
}
function exec_cz(c, n) {
    update_max_bit(c);
    update_max_bit(n);
    var amps2 = {};
    for(state in amps) {
        var a = amps[state];
        if (!is_1(state, c)) {
            m_add(amps2, state, a);
            continue;
        }
        if (is_1(state, n)) {
            m_add(amps2, state, mult(a, [-1, 0]));
        } else {
            m_add(amps2, state, a);
        }
    }
    amps = amps2;
    commands = commands + " CZ["
        +c + "," + n + "]";
}
function exec_ccz(c1, c2, n) {
    update_max_bit(c1);
    update_max_bit(c2);
    update_max_bit(n);
    var amps2 = {};
    for(state in amps) {
        var a = amps[state];
        if (!is_1(state, c1)) {
            m_add(amps2, state, a);
            continue;
        }
        if (!is_1(state, c2)) {
            m_add(amps2, state, a);
            continue;
        }
        if (is_1(state, n)) {
            m_add(amps2, state, mult(a, [-1, 0]));
        } else {
            m_add(amps2, state, a);
        }
    }
    amps = amps2;
    commands = commands + " CCZ["
        + c1 + "," + c2 + "," + n + "]";
}
function exec_r(n_r) {
    var nrs = n_r.split(":");
    var n = parseInt(nrs[0]);
    update_max_bit(n);
    var r = parseFloat(nrs[1]);
    var rot = [Math.cos(r * Math.PI), Math.sin(r * Math.PI)];
    var amps2 = {};
    for(state in amps) {
        var a = amps[state];
        if (is_1(state, n)) {
            m_add(amps2, state, mult(a, rot));
        } else {
            m_add(amps2, state, a);
        }
    }
    amps = amps2;
    commands = commands + " R["
        + n + "," + r + " *pi" + "]";
}
function exec_cr(c, n_r) {
    update_max_bit(c);
    var nrs = n_r.split(":");
    var n = parseInt(nrs[0]);
    update_max_bit(n);
    var r = parseFloat(nrs[1]);
    var rot = [Math.cos(r * Math.PI), Math.sin(r * Math.PI)];
    var amps2 = {};
    for(state in amps) {
        var a = amps[state];
        if (!is_1(state, c)) {
            m_add(amps2, state, a);
            continue;
        }
        if (is_1(state, n)) {
            m_add(amps2, state, mult(a, rot));
        } else {
            m_add(amps2, state, a);
        }
    }
    amps = amps2;
    commands = commands + " CR["
        + c + "," + n + "," + r + " *pi" + "]";
}
function exec_ccr(c1, c2, n_r) {
    update_max_bit(c1);
    update_max_bit(c2);
    var nrs =n_r.split(":");
    var n = parseInt(nrs[0]);
    update_max_bit(n);
    var r = parseFloat(nrs[1]);
    var rot = [Math.cos(r * Math.PI), Math.sin(r * Math.PI)];
    var amps2 = {};
    for(state in amps) {
        var a = amps[state];
        if (!is_1(state, c1)) {
            m_add(amps2, state, a);
            continue;
        }
        if (!is_1(state, c2)) {
            m_add(amps2, state, a);
            continue;
        }
        if (is_1(state, n)) {
            m_add(amps2, state, mult(a, rot));
        } else {
            m_add(amps2, state, a);
        }
    }
    amps = amps2;
    commands = commands + " CCR["
        + c1 + "," + c2 + "," + n + "," + r + " *pi" + "]";
}
function probability(a) {
    return a[0]*a[0]+a[1]*a[1];
}
function exec_m(n) {
    update_max_bit(n);
    var p0 = 0.0;
    var p1 = 0.0;
    for (state in amps) {
        if (is_1(state, n)) {
            p1 = p1 + probability(amps[state]);
        } else {
            p0 = p0 + probability(amps[state]);
        }
    }
    var b = (p1 > Math.random()) ? true : false;
    var ip = 1.0 / Math.sqrt(b ? p1 : p0);
    var amps2 = {};
    for (state in amps) {
        var a = amps[state];
        if (is_1(state, n) == b) {
            m_add(amps2, state, [a[0] * ip, a[1] * ip]);
        }
    }
    amps = amps2;
    commands = commands + " M["
        + n + "]";
}
function exec_cmd_cc(a0, a1) {
    var c2 = get_cmd2();
    var a2 = get_arg2();
    if (a0 == a2 || a1 == a2) {
        set_error("invalid argument");
        return;
    }
    switch(c2) {
    case "H":
        exec_cch(a0, a1, parseInt(a2));
        break;
    case "X":
        exec_ccx(a0, a1, parseInt(a2));
        break;
    case "Y":
        exec_ccy(a0, a1, parseInt(a2));
        break;
    case "Z":
        exec_ccz(a0, a1, parseInt(a2));
        break;
    case "R":
        exec_ccr(a0, a1, a2);
        break;
    }
}
function exec_cmd_c(a0) {
    var c1 = get_cmd1();
    var a1 = get_arg1();
    if (a0 == a1) {
        set_error("invalid argument");
        return;
    }
    switch(c1) {
    case "C":
        exec_cmd_cc(a0, parseInt(a1));
        break;
    case "H":
        exec_ch(a0, parseInt(a1));
        break;
    case "X":
        exec_cx(a0, parseInt(a1));
        break;
    case "Y":
        exec_cy(a0, parseInt(a1));
        break;
    case "Z":
        exec_cz(a0, parseInt(a1));
        break;
    case "R":
        exec_cr(a0, a1);
        break;
    }
}
function exec_cmd() {
    var c0 = get_cmd0();
    var a0 = get_arg0();
    var c2 = get_cmd2();
    var a2 = get_arg2();
    switch(c0) {
    case "C":
        exec_cmd_c(parseInt(a0));
        break;
    case "H":
        exec_h(parseInt(a0));
        break;
    case "X":
        exec_x(parseInt(a0));
        break;
    case "Y":
        exec_y(parseInt(a0));
        break;
    case "Z":
        exec_z(parseInt(a0));
        break;
    case "R":
        exec_r(a0);
        break;
    case "M":
        exec_m(parseInt(a0));
        break;
    }
    disp();
}
function key_in(c) {
    switch(c) {
    case "C":
    case "H":
    case "X":
    case "Y":
    case "R":
        var c0 = get_cmd();
        if (c0 === "" || c0 === "C") {
            set_cmd(c);
        } else {
            exec_cmd();
            clear_cmd();
            set_cmd(c);
        }
        break;
    case "Z":
        var c0 = get_cmd();
        if (c0 === "" || c0 === "C") {
            set_cmd(c);
        } else if (c0 === "R") {
            var a = get_arg();
            if (a) {
                set_arg(":");
            }
        } else {
            exec_cmd();
            clear_cmd();
            set_cmd(c);
        }
        break;
    case "M":
        var c1 = get_cmd();
        if (c1 === "") {
            set_cmd(c);
        } else if (c1 != "C") {
            exec_cmd();
            clear_cmd();
            set_cmd(c);
        }
        break;
    case "=":
        exec_cmd();
        clear_cmd();
        break;
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
        set_arg(c);
        break;
    case ".":
        set_arg_dot();
        break;
    case "-":
        set_arg_negative();
        break;
    }
}
