(function () {
    "use strict";

    const shop = window.SHOQAN;
    const services = {
        suit: "Suit fitting",
        shirt: "Shirt fitting",
        alterations: "Alterations consultation"
    };
    const fittingTimes = ["11:00", "13:00", "15:00", "17:00"];

    function localDateString(date) {
        return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") +
            "-" + String(date.getDate()).padStart(2, "0");
    }

    function isRealDate(value) {
        if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
        const date = new Date(value + "T12:00:00");
        return !Number.isNaN(date.getTime()) && localDateString(date) === value;
    }

    class Booking {
        constructor(data) {
            this.id = data.id;
            this.update(data);
        }

        update(data) {
            this.name = data.name.trim();
            this.date = data.date;
            this.time = data.time;
            this.service = data.service;
            this.notes = (data.notes || "").trim();
        }

        getLabel() {
            const date = new Date(this.date + "T12:00:00").toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric"
            });
            return services[this.service] + " · " + date + " at " + this.time;
        }

        isPast() {
            return new Date(this.date + "T" + this.time + ":00").getTime() < Date.now();
        }

        toJSON() {
            return {
                id: this.id, name: this.name, date: this.date,
                time: this.time, service: this.service, notes: this.notes
            };
        }
    }

    shop.Booking = Booking;

    document.addEventListener("DOMContentLoaded", function () {
        const form = document.getElementById("booking-form");
        const list = document.getElementById("booking-list");
        const dateInput = document.getElementById("booking-date");
        const feedback = document.getElementById("booking-feedback");
        const fieldNames = ["name", "service", "date", "time", "notes"];
        let editingId = null;
        let bookings = loadBookings();

        function loadBookings() {
            const stored = shop.readStorage("bookings", []);
            if (!Array.isArray(stored)) return [];
            const restored = [];
            stored.forEach(function (data) {
                if (!data || typeof data !== "object" || Array.isArray(data)) return;
                if (typeof data.id !== "string" || data.id.length < 1 || data.id.length > 80) return;
                if (typeof data.name !== "string" || data.name.trim().length < 2 || data.name.length > 80) return;
                if (!isRealDate(data.date) || !fittingTimes.includes(data.time)) return;
                if (!Object.keys(services).includes(data.service)) return;
                if (data.notes !== undefined && (typeof data.notes !== "string" || data.notes.length > 300)) return;
                const duplicate = restored.some(function (booking) {
                    return booking.id === data.id || (booking.date === data.date && booking.time === data.time);
                });
                                                                                               
                if (!duplicate) restored.push(new Booking(data));
            });
            return restored;
        }

        function updateDateRange() {
            const today = new Date();
            const lastDay = new Date(today);
            lastDay.setDate(lastDay.getDate() + 90);
            dateInput.min = localDateString(today);
            dateInput.max = localDateString(lastDay);
        }

        function showFieldError(name, message) {
            const field = document.getElementById("booking-" + name);
            document.getElementById("booking-" + name + "-error").textContent = message;
            field.classList.toggle("is-invalid", Boolean(message));
            field.setAttribute("aria-invalid", String(Boolean(message)));
        }

        function readForm() {
            const values = {};
            fieldNames.forEach(function (name) {
                values[name] = document.getElementById("booking-" + name).value.trim();
            });
            return values;
        }

        function validateForm(values) {
            updateDateRange();
            const validDate = isRealDate(values.date) && values.date >= dateInput.min && values.date <= dateInput.max;
            let timeError = fittingTimes.includes(values.time) ? "" : "Choose one of the offered fitting times.";
            if (validDate && !timeError && new Date(values.date + "T" + values.time + ":00").getTime() <= Date.now()) {
                timeError = "This time has already passed. Choose a future slot.";
            }
            if (validDate && !timeError && bookings.some(function (booking) {
                return booking.id !== editingId && booking.date === values.date && booking.time === values.time;
            })) {
                timeError = "You already have an appointment at this date and time. Choose another slot.";
            }
            const checks = [
                ["name", values.name.length >= 2 && values.name.length <= 80 ? "" : "Enter a name of 2–80 characters."],
                ["service", Object.keys(services).includes(values.service) ? "" : "Choose a fitting service."],
                ["date", validDate ? "" : "Choose a valid date from today through the next 90 days."],
                ["time", timeError],
                ["notes", values.notes.length <= 300 ? "" : "Keep your notes to 300 characters or fewer."]
            ];
            let firstInvalid = null;
            checks.forEach(function (check) {
                showFieldError(check[0], check[1]);
                if (check[1] && !firstInvalid) firstInvalid = document.getElementById("booking-" + check[0]);
            });
            if (firstInvalid) firstInvalid.focus();
            return firstInvalid === null;
        }

        function resetForm() {
            editingId = null;
            form.reset();
            updateDateRange();
            fieldNames.forEach(function (name) { showFieldError(name, ""); });
            document.getElementById("booking-form-error").textContent = "";
            document.getElementById("booking-form-title").textContent = "Add an appointment";
            document.getElementById("booking-submit").textContent = "Add booking";
            document.getElementById("booking-cancel").hidden = true;
        }

        function saveBookings(message) {
            const saved = shop.writeStorage("bookings", bookings.map(function (booking) {
                return booking.toJSON();
            }));
            feedback.textContent = message + (saved ? " Saved in this browser." : " Browser storage is unavailable; this change lasts only on this page.");
            shop.notify(feedback.textContent);
        }

        function createBookingCard(booking) {
            const card = document.createElement("li");
            card.className = "booking-card";
            card.classList.toggle("is-editing", booking.id === editingId);
            const status = document.createElement("p");
            status.className = "booking-status";
            status.textContent = booking.isPast() ? "Past appointment" : "Upcoming appointment";
            const title = document.createElement("h4");
            title.textContent = booking.getLabel();
            const name = document.createElement("p");
            name.textContent = "For: " + booking.name;
            card.append(status, title, name);
            if (booking.notes) {
                const notes = document.createElement("p");
                notes.className = "booking-notes";
                notes.textContent = booking.notes;
                card.appendChild(notes);
            }
            const actions = document.createElement("div");
            actions.className = "booking-actions";
            ["edit", "delete"].forEach(function (action) {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "btn btn-outline-shoqan btn-sm";
                button.dataset.bookingAction = action;
                button.dataset.bookingId = booking.id;
                button.textContent = action === "edit" ? "Edit" : "Delete";
                button.setAttribute("aria-label", button.textContent + " " + booking.getLabel() + " for " + booking.name);
                actions.appendChild(button);
            });
            card.appendChild(actions);
            return card;
        }

        function renderBookings() {
            list.replaceChildren();
            const ordered = bookings.slice().sort(function (a, b) {
                return (a.date + a.time).localeCompare(b.date + b.time);
            });
            ordered.forEach(function (booking) { list.appendChild(createBookingCard(booking)); });
            list.hidden = bookings.length === 0;
            document.getElementById("bookings-empty").hidden = bookings.length !== 0;
            document.getElementById("bookings-clear").disabled = bookings.length === 0;
            document.getElementById("booking-count").textContent = bookings.length + (bookings.length === 1 ? " saved appointment" : " saved appointments");
        }

        function startEditing(booking) {
            editingId = booking.id;
            updateDateRange();
            fieldNames.forEach(function (name) {
                document.getElementById("booking-" + name).value = booking[name];
                showFieldError(name, "");
            });
            document.getElementById("booking-form-error").textContent = "";
            document.getElementById("booking-form-title").textContent = "Edit appointment";
            document.getElementById("booking-submit").textContent = "Save changes";
            document.getElementById("booking-cancel").hidden = false;
            feedback.textContent = booking.isPast() ? "Choose a new future slot to reschedule this past appointment." : "Edit the details, then save your changes.";
            renderBookings();
            document.getElementById("booking-name").focus();
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const values = readForm();
            if (!validateForm(values)) return;
            if (editingId) {
                const booking = bookings.find(function (item) { return item.id === editingId; });
                if (!booking) {
                    document.getElementById("booking-form-error").textContent = "This appointment no longer exists. Cancel editing and add a new one.";
                    return;
                }
                booking.update(values);
                saveBookings("Appointment updated.");
            } else {
                values.id = "booking-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
                bookings.push(new Booking(values));
                saveBookings("Appointment added.");
            }
            resetForm();
            renderBookings();
        });

        form.addEventListener("input", function (event) {
            const name = event.target.name;
            if (fieldNames.includes(name)) showFieldError(name, "");
            if (name === "date") showFieldError("time", "");
        });

        document.getElementById("booking-cancel").addEventListener("click", function () {
            resetForm();
            renderBookings();
            feedback.textContent = "Editing cancelled. Your saved appointment was not changed.";
            document.getElementById("booking-name").focus();
        });

        list.addEventListener("click", function (event) {
            const button = event.target.closest("button[data-booking-action]");
            if (!button) return;
            const booking = bookings.find(function (item) { return item.id === button.dataset.bookingId; });
            if (!booking) return;
            if (button.dataset.bookingAction === "edit") {
                startEditing(booking);
            } else {
                bookings = bookings.filter(function (item) { return item.id !== booking.id; });
                if (editingId === booking.id) resetForm();
                saveBookings("Appointment deleted.");
                renderBookings();
            }
        });

        document.getElementById("bookings-clear").addEventListener("click", function () {
            if (!bookings.length || !window.confirm("Delete all saved demo appointments?")) return;
            bookings = [];
            resetForm();
            saveBookings("All appointments cleared.");
            renderBookings();
        });

        window.addEventListener("storage", function (event) {
            if (event.key !== "shoqan.bookings" && event.key !== null) return;
            bookings = loadBookings();
            if (editingId && !bookings.some(function (booking) { return booking.id === editingId; })) resetForm();
            renderBookings();
        });

        updateDateRange();
        renderBookings();
    });
}());
