Number.prototype.constrain = function(n1, n2) {
    var min = (n1 < n2) ? n1 : n2,
        max = (n1 < n2) ? n2 : n1,
        num = Number(this);
    if (num < min) num = min;
    if (num > max) num = max;
    return num;
}
