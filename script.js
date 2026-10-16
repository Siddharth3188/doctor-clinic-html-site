/* =========================================================
   Doctor & Clinic Website Demo - script.js
   1. CONFIG  (edit this block for each doctor)
   2. Fill page from CONFIG
   3. Mobile navigation
   4. Service links -> pre-select consultation type
   5. FAQ accordion
   6. Appointment form (validation + WhatsApp message)
   ========================================================= */

/* 1. CONFIG ------------------------------------------------
   Everything a new doctor needs is here. Anything left as a
   [placeholder] stays visible on the page so it is easy to spot.
   Phone / WhatsApp: digits only for the *Link fields, with country code.
   Example: whatsappNumber: "919876543210"  (India = 91)        */
const CONFIG = {
  doctorName: "[Doctor Name]",
  clinicName: "[Clinic Name]",
  specialty: "[Medical Specialty]",
  qualifications: "[Medical Degree and Qualifications]",
  experience: "[Years of Experience]",

  phoneDisplay: "[Phone Number]",
  phoneNumber: "+91XXXXXXXXXX",          // used for tel: links
  whatsappDisplay: "[WhatsApp Number]",
  whatsappNumber: "91XXXXXXXXXX",        // used for https://wa.me/ links
  email: "[Email Address, if supplied]",

  address: "[Clinic Address]",
  hours: "[Consultation Hours]",
  appointmentMethod: "[Appointment Method, e.g. phone or WhatsApp]",
  accessibility: "[Accessibility or visitor information, if supplied]",

  // Paste the clinic's real Google Maps link here (Share > Copy link).
  mapsUrl: "https://www.google.com/maps"
};

/* 2. FILL PAGE FROM CONFIG --------------------------------- */
function isPlaceholder(value) {
  return /X{4,}/.test(value) || /^\[.*\]$/.test(value);
}

document.querySelectorAll("[data-cfg]").forEach(function (el) {
  var key = el.getAttribute("data-cfg");
  if (CONFIG[key]) el.textContent = CONFIG[key];
});

document.querySelectorAll('[data-link="tel"]').forEach(function (a) {
  a.href = "tel:" + CONFIG.phoneNumber;
});
document.querySelectorAll('[data-link="whatsapp"]').forEach(function (a) {
  a.href = "https://wa.me/" + CONFIG.whatsappNumber;
});
document.querySelectorAll('[data-link="maps"]').forEach(function (a) {
  a.href = CONFIG.mapsUrl;
});

if (CONFIG.doctorName && !isPlaceholder(CONFIG.doctorName)) {
  document.title = "Dr. " + CONFIG.doctorName + " | " + CONFIG.specialty + " | " + CONFIG.clinicName;
}
document.getElementById("year").textContent = new Date().getFullYear();

/* 3. MOBILE NAVIGATION ------------------------------------- */
(function () {
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");

  function setOpen(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener("click", function (e) {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) setOpen(false);
  });
})();

/* 4. SERVICE LINKS ----------------------------------------- */
document.querySelectorAll("[data-service]").forEach(function (link) {
  link.addEventListener("click", function () {
    var select = document.getElementById("pType");
    select.value = link.getAttribute("data-service");
  });
});

/* 5. FAQ ACCORDION ----------------------------------------- */
document.querySelectorAll(".acc-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    document.getElementById(btn.getAttribute("aria-controls")).hidden = open;
  });
});

/* 6. APPOINTMENT FORM -------------------------------------- */
(function () {
  var form = document.getElementById("apptForm");
  var review = document.getElementById("review");
  var reviewText = document.getElementById("reviewText");
  var notice = document.getElementById("reviewNotice");
  var waSend = document.getElementById("waSend");
  var dateInput = document.getElementById("pDate");

  // Do not allow past dates (local date).
  var now = new Date();
  var today = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
  dateInput.min = today;

  function setError(id, message) {
    var input = document.getElementById(id);
    var err = document.getElementById(id + "-err");
    err.textContent = message;
    input.closest(".field").classList.toggle("invalid", !!message);
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
    if (message) input.setAttribute("aria-describedby", id + "-err");
    return !message;
  }

  function validate() {
    var ok = true;
    var name = document.getElementById("pName").value.trim();
    var phone = document.getElementById("pPhone").value.trim();
    var date = dateInput.value;
    var type = document.getElementById("pType").value;
    var firstBad = null;

    function check(id, message) {
      var good = setError(id, message);
      if (!good && !firstBad) firstBad = document.getElementById(id);
      ok = ok && good;
    }

    check("pName", name.length < 2 ? "Please enter the patient's name." : "");
    check("pPhone", phone.replace(/\D/g, "").length < 8 || !/^[+\d][\d\s\-()]*$/.test(phone) ? "Please enter a valid phone number." : "");
    check("pDate", !date ? "Please choose a preferred date." : (date < today ? "Please choose today or a future date." : ""));
    check("pType", !type ? "Please select a consultation type." : "");

    if (firstBad) firstBad.focus();
    return ok;
  }

  function formatDate(iso) {
    var p = iso.split("-");
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;

    var doctor = isPlaceholder(CONFIG.doctorName) ? "the doctor" : "Dr. " + CONFIG.doctorName;
    var msg = document.getElementById("pMsg").value.trim();
    var lines = [
      "Hello, I would like to enquire about an appointment with " + doctor + ".",
      "",
      "Name: " + document.getElementById("pName").value.trim(),
      "Phone: " + document.getElementById("pPhone").value.trim(),
      "Preferred date: " + formatDate(dateInput.value),
      "Consultation type: " + document.getElementById("pType").value
    ];
    if (msg) lines.push("Message: " + msg);
    var text = lines.join("\n");

    reviewText.textContent = text;
    waSend.href = "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(text);

    if (isPlaceholder(CONFIG.whatsappNumber)) {
      notice.hidden = false;
      notice.textContent = "Demo note: the clinic's WhatsApp number has not been set yet, so WhatsApp will not reach a real clinic. Add it in CONFIG in script.js.";
    } else {
      notice.hidden = true;
    }

    form.hidden = true;
    review.hidden = false;
    review.focus();
  });

  document.getElementById("editBtn").addEventListener("click", function () {
    review.hidden = true;
    form.hidden = false;
    document.getElementById("pName").focus();
  });

  // Clear an error as soon as the user fixes the field.
  ["pName", "pPhone", "pDate", "pType"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () { setError(id, ""); });
  });
})();
