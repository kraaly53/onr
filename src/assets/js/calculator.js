// Commercial Script Calculator — same rules and read speeds as the original csc.js, without jQuery.

// Read speeds (words per minute / syllables per second). Change these to tune the calculator.
var syllableSlow = 3.7, syllableNormal = 4.4, syllableFast = 5.2;
var wordSlow = 150, wordNormal = 180, wordFast = 240;

// DO NOT CHANGE STUFF BELOW THIS LINE //
(function () {
  "use strict";

  function numToWords(n) {
    var a = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    var b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    var g = ["", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion", "sextillion", "septillion", "octillion", "nonillion"];
    n = String(n);
    if (n === "0") return "zero";
    var digits = Array.from(n).reverse();
    var groups = [];
    for (var i = 0; i < digits.length; i += 3) groups.push(digits.slice(i, i + 3));
    return groups
      .map(function (grp) {
        var ones = grp[0], tens = grp[1], huns = grp[2];
        return [
          (Number(huns) || 0) === 0 ? "" : a[huns] + " hundred ",
          (Number(ones) || 0) === 0 ? b[tens] : (b[tens] && b[tens] + " ") || "",
          a[tens + ones] || a[ones],
        ].join("");
      })
      .map(function (grp, i) { return grp === "" ? grp : grp + " " + g[i]; })
      .filter(function (x) { return x.length !== 0; })
      .reverse()
      .join(" ");
  }

  function spokenWords(text) {
    var word = text.toLowerCase();

    // emails
    word = word.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi, function (email) {
      return email.replace(/[@]/g, " at ").replace(/[.]/g, " dot ");
    });

    // web addresses
    word = word.replace(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/gi, function (url) {
      return url
        .replace(/\bhttps\b/g, "eitch tee tee pea ess ")
        .replace(/\bhttp\b/g, "eitch tee tee pea ")
        .replace(/[:]/g, "colon ")
        .replace(/[/]/g, "back slash ")
        .replace(/[w]/g, "doubleu ")
        .replace(/[.]/g, " dot ");
    });

    // phone numbers, digit by digit
    word = word.replace(/(\d+-\d+-\d+-\d+)|(\d+-\d+-\d+)|(\d+-\d+)|(\(\d+\)\d+-\d+)/g, function (match) {
      if (match.length > 15) return "overflow";
      match = match.replace(/-/g, "");
      var out = "";
      for (var i = 0; i < match.length; i++) out += numToWords(match.charAt(i));
      return out;
    });

    // money
    word = word.replace(/([$]+\d+\.\d+)|(\d+\.\d+)/gi, function (dollars) {
      var first = dollars.charAt(0), second = dollars.charAt(1);
      if (first == "$" && second != "0") dollars = dollars.replace(/[.]/g, " and cents ").replace(/[$]/g, "dollars ");
      if (first == "$" && second == "0") dollars = dollars.replace(/^.{3}/g, "cents ");
      return dollars;
    });

    // remaining numbers
    word = word.replace(/(\d+)/g, function (n) { return numToWords(n); });

    // special characters
    word = word
      .replace(/[$]/g, "dollars ")
      .replace(/[%]/g, "percent ")
      .replace(/[#]/g, "hashtag ")
      .replace(/[+]/g, "plus ")
      .replace(/[=]/g, "equals ")
      .replace(/[&]/g, "and ")
      .replace(/[@]/g, " at ");

    return word
      .replace(/-/g, " ")
      .replace(/(^\s*)|(\s*$)/gi, "")
      .replace(/[ ]{2,}/gi, " ")
      .replace(/\n /, "\n");
  }

  var btn = document.getElementById("calculateScript");
  if (!btn) return;
  btn.addEventListener("click", function () {
    var word = spokenWords(document.getElementById("message").value);
    var wCount = word.split(" ").filter(function (s) { return s != ""; }).length;
    var speed = document.getElementById("speed").value;
    var wSpeed = speed === "1" ? wordSlow : speed === "3" ? wordFast : wordNormal;
    var wTime = ((wCount / wSpeed) * 60).toFixed(2);
    document.getElementById("wcount").value = wCount;
    document.getElementById("wlength").value = wTime + " seconds";
    document.getElementById("results").value = word;
  });
})();
