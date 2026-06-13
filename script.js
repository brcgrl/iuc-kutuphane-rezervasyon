const USERS_KEY = "iucModernUsers";
const CURRENT_USER_KEY = "iucModernCurrentUser";
const RESERVATIONS_KEY = "iucModernReservations";

const LIBRARY_LOCATION = {
    latitude: 40.98623,
    longitude: 28.72780,
    radiusMeters: 45
};

const MAX_DAILY_SESSIONS = 4;
const NO_SHOW_PENALTY_POINTS = 10;
const ACCESS_BLOCK_DAYS = 2;

const LEVELS = [
    { name: "Çaylak Kütüphaneci", minPoints: 0 },
    { name: "Raf Kaşifi", minPoints: 20 },
    { name: "Sessizlik Muhafızı", minPoints: 50 },
    { name: "Kitap Kurdu", minPoints: 90 },
    { name: "Baş Kütüphaneci", minPoints: 140 }
];

const RANKS = [
    { name: "Bronz Raf", minPoints: 0, icon: "🥉" },
    { name: "Gümüş Raf", minPoints: 30, icon: "🥈" },
    { name: "Altın Raf", minPoints: 70, icon: "🥇" },
    { name: "Safir Salon", minPoints: 120, icon: "💎" },
    { name: "Efsane Kütüphaneci", minPoints: 200, icon: "🏆" }
];

const LEVEL_DETAILS = {
    "Çaylak Kütüphaneci": {
        icon: "🌱",
        message: "İlk katılımını doğrulayarak seviyeni yükseltmeye başla."
    },
    "Raf Kaşifi": {
        icon: "🧭",
        message: "Kütüphane alışkanlığını oluşturmaya başladın."
    },
    "Sessizlik Muhafızı": {
        icon: "🔕",
        message: "Düzenli katılımınla sessiz çalışma kültürünü güçlendiriyorsun."
    },
    "Kitap Kurdu": {
        icon: "📚",
        message: "Kütüphaneyi düzenli kullanma konusunda oldukça istikrarlısın."
    },
    "Baş Kütüphaneci": {
        icon: "👑",
        message: "En yüksek seviyeye ulaştın. Kütüphane disiplininin ustasısın."
    }
};

const DEMO_MONTHLY_LEADERBOARD = [
    { name: "Deniz A.", monthlyPoints: 95 },
    { name: "Ece K.", monthlyPoints: 80 },
    { name: "Mert Y.", monthlyPoints: 65 },
    { name: "Elif T.", monthlyPoints: 50 },
    { name: "Arda S.", monthlyPoints: 40 },
    { name: "Zeynep C.", monthlyPoints: 30 },
    { name: "Berk D.", monthlyPoints: 20 }
];

function getCurrentMonthKey() {
    return new Date().toISOString().slice(0, 7);
}

function ensureMonthlyPoints(user) {
    const monthKey = getCurrentMonthKey();

    if (user.monthlyPointsMonth !== monthKey) {
        user.monthlyPoints = 0;
        user.monthlyPointsMonth = monthKey;
    }

    return user.monthlyPoints || 0;
}

const TABLES = [
    { id: "L1", name: "Sol Masa 1", x: 8,  y: 16, width: 21, height: 6, seats: 10 },
    { id: "L2", name: "Sol Masa 2", x: 8,  y: 28, width: 21, height: 6, seats: 10 },
    { id: "L3", name: "Sol Masa 3", x: 8,  y: 40, width: 21, height: 6, seats: 10 },
    { id: "L4", name: "Sol Masa 4", x: 8,  y: 52, width: 21, height: 6, seats: 10 },
    { id: "L5", name: "Sol Masa 5", x: 8,  y: 64, width: 21, height: 6, seats: 10 },

    { id: "M1", name: "Orta Üst Masa", x: 42, y: 16, width: 16, height: 6, seats: 6 },
    { id: "M2", name: "Orta Masa 1", x: 45, y: 31, width: 10, height: 6, seats: 4 },
    { id: "M3", name: "Orta Masa 2", x: 45, y: 41, width: 10, height: 6, seats: 4 },
    { id: "M4", name: "Orta Masa 3", x: 45, y: 51, width: 10, height: 6, seats: 4 },
    { id: "M5", name: "Orta Masa 4", x: 45, y: 61, width: 10, height: 6, seats: 4 },
    { id: "M6", name: "Orta Masa 5", x: 45, y: 71, width: 10, height: 6, seats: 4 },

    { id: "R1", name: "Sağ Masa 1", x: 72, y: 16, width: 21, height: 6, seats: 10 },
    { id: "R2", name: "Sağ Masa 2", x: 72, y: 28, width: 21, height: 6, seats: 10 },
    { id: "R3", name: "Sağ Masa 3", x: 72, y: 40, width: 21, height: 6, seats: 10 },
    { id: "R4", name: "Sağ Masa 4", x: 72, y: 52, width: 21, height: 6, seats: 10 },
    { id: "R5", name: "Sağ Masa 5", x: 72, y: 64, width: 21, height: 6, seats: 10 },

    { id: "B1", name: "Alt Sol Masa 1", x: 8,  y: 80, width: 14, height: 6, seats: 6 },
    { id: "B2", name: "Alt Sol Masa 2", x: 25, y: 80, width: 14, height: 6, seats: 6 },
    { id: "B3", name: "Alt Orta Masa",  x: 47, y: 80, width: 10, height: 6, seats: 4 },

    { id: "PC1", name: "Bilgisayarlı Masa", x: 8, y: 92, width: 28, height: 5, seats: 6, computers: 4 }
];

const FIXED_OCCUPIED_SEATS = new Set([
    "L1-03", "L2-08", "L4-05", "M1-02", "M4-04",
    "R1-07", "R3-01", "R4-09", "B2-03", "PC1-06"
]);

let selectedSeatCode = null;
let locationWatchId = null;

const $ = (id) => document.getElementById(id);

function readStorage(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
    return readStorage(USERS_KEY, []);
}

function saveUsers(users) {
    writeStorage(USERS_KEY, users);
}

function getReservations() {
    return readStorage(RESERVATIONS_KEY, []);
}

function saveReservations(reservations) {
    writeStorage(RESERVATIONS_KEY, reservations);
}

function getCurrentUserEmail() {
    return localStorage.getItem(CURRENT_USER_KEY);
}

function getCurrentUser() {
    return getUsers().find((user) => user.email === getCurrentUserEmail()) || null;
}

function getActiveReservations() {
    const user = getCurrentUser();

    if (!user) {
        return [];
    }

    return getReservations()
        .filter((reservation) => {
            return reservation.email === user.email && reservation.status === "active";
        })
        .sort((a, b) => getReservationStartDate(a) - getReservationStartDate(b));
}

function getActiveReservation() {
    return getActiveReservations()[0] || null;
}

function getReservationStartDate(reservation) {
    const startTime = reservation.time.split(" - ")[0];
    return new Date(`${reservation.date}T${startTime}:00`);
}

function getReservationEndDate(reservation) {
    const endTime = reservation.time.split(" - ")[1];
    return new Date(`${reservation.date}T${endTime}:00`);
}

function getTodayString() {
    return new Date().toISOString().split("T")[0];
}

function getDailyReservationsForUser(date, email = getCurrentUserEmail()) {
    return getReservations().filter((reservation) => {
        return reservation.email === email &&
            reservation.date === date &&
            reservation.status !== "cancelled";
    });
}

function getDailySessionCount(date = $("reservationDate").value || getTodayString()) {
    return getDailyReservationsForUser(date).length;
}

function getSessionStartDate(dateValue, timeRange) {
    if (!dateValue || !timeRange) {
        return null;
    }

    const startTime = timeRange.split(" - ")[0];

    return new Date(`${dateValue}T${startTime}:00`);
}

function getSessionEndDate(dateValue, timeRange) {
    if (!dateValue || !timeRange) {
        return null;
    }

    const endTime = timeRange.split(" - ")[1];

    return new Date(`${dateValue}T${endTime}:00`);
}

function isPastSession(dateValue, timeRange) {
    const sessionStart = getSessionStartDate(dateValue, timeRange);

    return Boolean(sessionStart && sessionStart.getTime() <= Date.now());
}

function hasSameSessionReservation(dateValue, timeRange, email = getCurrentUserEmail()) {
    return getReservations().some((reservation) => {
        return reservation.email === email &&
            reservation.date === dateValue &&
            reservation.time === timeRange &&
            reservation.status !== "cancelled" &&
            reservation.status !== "invalid";
    });
}

function getReservationValidationError() {
    const selectedDate = $("reservationDate").value;
    const selectedTime = $("reservationTime").value;

    if (!selectedDate) {
        return "Önce rezervasyon tarihini seçmelisin.";
    }

    if (!selectedTime) {
        return "Önce saat aralığını seçmelisin.";
    }

    if (selectedDate < getTodayString()) {
        return "Geçmiş bir tarihe rezervasyon oluşturamazsın.";
    }

    if (isPastSession(selectedDate, selectedTime)) {
        return "Bu saat aralığı geçtiği için rezervasyon oluşturamazsın. Lütfen ileri bir saat seç.";
    }

    if (hasSameSessionReservation(selectedDate, selectedTime)) {
        return "Bu saat aralığı için zaten bir koltuk ayırdın. Aynı seansa ikinci bir koltuk seçemezsin.";
    }

    if (getDailySessionCount(selectedDate) >= MAX_DAILY_SESSIONS) {
        return "Aynı gün içerisinde en fazla 4 seans rezerve edebilirsin.";
    }

    if (isUserBlocked()) {
        return "Ceza süren devam ettiği için yeni rezervasyon oluşturamazsın.";
    }

    return "";
}

function showReservationValidationMessage(message = "", success = false) {
    const messageArea = $("reservationValidationMessage");

    if (!messageArea) {
        return;
    }

    messageArea.textContent = message;
    messageArea.classList.toggle("show", Boolean(message));
    messageArea.classList.toggle("success", Boolean(message && success));
}

function refreshAvailableTimeOptions() {
    const selectedDate = $("reservationDate").value;
    const timeSelect = $("reservationTime");
    const currentValue = timeSelect.value;

    Array.from(timeSelect.options).forEach((option) => {
        if (!option.value) {
            return;
        }

        const blockedByPastDate = selectedDate && selectedDate < getTodayString();
        const blockedByPastTime = selectedDate && isPastSession(selectedDate, option.value);
        const blockedByDuplicate = selectedDate && hasSameSessionReservation(selectedDate, option.value);

        option.disabled = Boolean(blockedByPastDate || blockedByPastTime || blockedByDuplicate);
    });

    const selectedOption = Array.from(timeSelect.options).find((option) => {
        return option.value === currentValue;
    });

    if (selectedOption && selectedOption.disabled) {
        timeSelect.value = "";
        selectedSeatCode = null;
    }
}

function getBlockedUntilDate(user = getCurrentUser()) {
    return user && user.accessBlockedUntil ? new Date(user.accessBlockedUntil) : null;
}

function isUserBlocked(user = getCurrentUser()) {
    const blockedUntil = getBlockedUntilDate(user);
    return Boolean(blockedUntil && blockedUntil.getTime() > Date.now());
}

function formatDateTime(dateValue) {
    return new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(dateValue);
}


function repairErroneousPastBookingPenalties() {
    const user = getCurrentUser();

    if (!user) {
        return;
    }

    const reservations = getReservations();
    const users = getUsers();
    const storedUser = users.find((item) => item.email === user.email);
    let changed = false;
    let pointsToRestore = 0;

    reservations.forEach((reservation) => {
        if (reservation.email !== user.email || reservation.status !== "missed") {
            return;
        }

        const createdAt = reservation.createdAt ? new Date(reservation.createdAt) : null;
        const sessionStart = getReservationStartDate(reservation);

        if (createdAt && createdAt.getTime() >= sessionStart.getTime()) {
            reservation.status = "invalid";
            reservation.invalidReason = "Geçmiş saat için oluşturulan hatalı rezervasyon";
            reservation.invalidatedAt = new Date().toISOString();

            pointsToRestore += reservation.penaltyApplied ? (reservation.penaltyPoints || NO_SHOW_PENALTY_POINTS) : 0;
            reservation.penaltyApplied = false;
            changed = true;
        }
    });

    if (!changed) {
        return;
    }

    storedUser.points = (storedUser.points || 0) + pointsToRestore;
    ensureMonthlyPoints(storedUser);
    storedUser.monthlyPoints = (storedUser.monthlyPoints || 0) + pointsToRestore;

    // Eski sürümde sadece hatalı geçmiş test rezervasyonundan kaynaklanan engeli temizle.
    storedUser.accessBlockedUntil = null;

    saveReservations(reservations);
    saveUsers(users);

    showToast("Geçmiş saate ait hatalı test rezervasyonu temizlendi. Ceza kaldırıldı.");
}

function applyOverdueNoShowPenalties() {
    const user = getCurrentUser();

    if (!user) {
        return;
    }

    const reservations = getReservations();
    const users = getUsers();
    const storedUser = users.find((item) => item.email === user.email);
    let changed = false;
    let penaltyApplied = false;

    reservations.forEach((reservation) => {
        if (reservation.email !== user.email || reservation.status !== "active") {
            return;
        }

        const sessionStart = getReservationStartDate(reservation);
        const sessionEnd = getReservationEndDate(reservation);
        const createdAt = reservation.createdAt ? new Date(reservation.createdAt) : null;

        // Önceki sürümde yanlışlıkla geçmiş saat için oluşturulan test rezervasyonlarını
        // cezalandırmadan geçersiz hale getir.
        const createdAfterSessionStarted =
            createdAt && createdAt.getTime() >= sessionStart.getTime();

        if (createdAfterSessionStarted) {
            reservation.status = "invalid";
            reservation.invalidReason = "Geçmiş saat için oluşturulan hatalı rezervasyon";
            reservation.invalidatedAt = new Date().toISOString();
            changed = true;
            return;
        }

        const overdue =
            !reservation.attendanceVerified &&
            sessionEnd.getTime() < Date.now();

        if (!overdue) {
            return;
        }

        reservation.status = "missed";
        reservation.penaltyApplied = true;
        reservation.penaltyPoints = NO_SHOW_PENALTY_POINTS;
        reservation.penaltyAppliedAt = new Date().toISOString();

        storedUser.points = Math.max(0, (storedUser.points || 0) - NO_SHOW_PENALTY_POINTS);

        ensureMonthlyPoints(storedUser);
        storedUser.monthlyPoints = Math.max(
            0,
            (storedUser.monthlyPoints || 0) - NO_SHOW_PENALTY_POINTS
        );

        storedUser.streak = 0;

        const blockedUntil = new Date();
        blockedUntil.setDate(blockedUntil.getDate() + ACCESS_BLOCK_DAYS);

        const existingBlockedUntil = storedUser.accessBlockedUntil
            ? new Date(storedUser.accessBlockedUntil)
            : null;

        if (!existingBlockedUntil || existingBlockedUntil < blockedUntil) {
            storedUser.accessBlockedUntil = blockedUntil.toISOString();
        }

        changed = true;
        penaltyApplied = true;
    });

    if (changed) {
        saveReservations(reservations);
        saveUsers(users);
    }

    if (penaltyApplied) {
        showToast("Katılımı doğrulanmayan seans için ceza uygulandı: -10 puan ve 2 gün erişim engeli.");
    }
}

function showToast(message) {
    const toast = $("toast");

    toast.textContent = message;
    toast.classList.add("show");

    window.setTimeout(() => {
        toast.classList.remove("show");
    }, 2700);
}

function showView(viewId) {
    document.querySelectorAll(".view").forEach((view) => {
        view.classList.remove("active");
    });

    $(viewId).classList.add("active");
}

function showDashboardPanel(panelId) {
    const titles = {
        libraryPanel: "Kütüphane Durumu",
        reservationsPanel: "Rezervasyonlarım",
        profilePanel: "Profil Bilgileri",
        levelsPanel: "Seviyeler"
    };

    document.querySelectorAll(".dashboard-panel").forEach((panel) => {
        panel.classList.remove("active");
    });

    document.querySelectorAll(".sidebar-link").forEach((button) => {
        button.classList.toggle("active", button.dataset.panel === panelId);
    });

    $(panelId).classList.add("active");
    $("dashboardTitle").textContent = titles[panelId];

    applyOverdueNoShowPenalties();

    if (panelId === "libraryPanel") {
        renderReservationAccessBanner();
        renderFloorPlan();
        renderMetrics();
    }

    if (panelId === "reservationsPanel") {
        renderReservations();
    }

    if (panelId === "profilePanel" || panelId === "levelsPanel") {
        renderProfile();
    }
}

function updateHeader() {
    const user = getCurrentUser();
    const signedIn = Boolean(user);

    $("landingLoginButton").classList.toggle("hidden", signedIn);
    $("signedInActions").classList.toggle("hidden", !signedIn);

    if (user) {
        $("headerUserName").textContent = user.name;
        $("dashboardUserName").textContent = user.name;
        $("dashboardUserEmail").textContent = user.email;
    }
}

function goToReservationFlow() {
    const user = getCurrentUser();

    if (!user) {
        showView("authView");
        showLoginTab();
        return;
    }

    enterDashboard();
}

function enterDashboard() {
    const user = getCurrentUser();

    if (!user) {
        showView("authView");
        return;
    }

    updateHeader();
    showView("dashboardView");

    repairErroneousPastBookingPenalties();
    applyOverdueNoShowPenalties();
    showDashboardPanel("libraryPanel");

    renderLandingOccupancyTable();
    renderFloorPlan();
    renderMetrics();
    renderReservations();
    renderProfile();
}

function showLoginTab() {
    $("loginForm").classList.remove("hidden");
    $("registerForm").classList.add("hidden");

    $("showLoginTab").classList.add("active");
    $("showRegisterTab").classList.remove("active");
}

function showRegisterTab() {
    $("registerForm").classList.remove("hidden");
    $("loginForm").classList.add("hidden");

    $("showRegisterTab").classList.add("active");
    $("showLoginTab").classList.remove("active");
}

function logout() {
    if (locationWatchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(locationWatchId);
        locationWatchId = null;
    }

    localStorage.removeItem(CURRENT_USER_KEY);
    updateHeader();
    showView("landingView");
    showToast("Çıkış yapıldı.");
}

$("startReservationButton").addEventListener("click", goToReservationFlow);
$("tableReservationButton").addEventListener("click", goToReservationFlow);
$("landingLoginButton").addEventListener("click", () => {
    showView("authView");
    showLoginTab();
});

$("backToLandingButton").addEventListener("click", () => {
    showView("landingView");
});

$("showLoginTab").addEventListener("click", showLoginTab);
$("showRegisterTab").addEventListener("click", showRegisterTab);
$("logoutButton").addEventListener("click", logout);

$("forgotPasswordButton").addEventListener("click", () => {
    $("passwordModal").classList.add("show");
});

$("closePasswordModalButton").addEventListener("click", () => {
    $("passwordModal").classList.remove("show");
});

$("sendPasswordResetButton").addEventListener("click", () => {
    showToast("Şifre sıfırlama bağlantısı gönderildi.");
    $("passwordModal").classList.remove("show");
});

$("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const email = $("loginEmail").value.trim().toLowerCase();
    const password = $("loginPassword").value;

    const user = getUsers().find((item) => {
        return item.email === email && item.password === password;
    });

    if (!user) {
        showToast("E-posta veya şifre yanlış.");
        return;
    }

    localStorage.setItem(CURRENT_USER_KEY, email);
    $("loginForm").reset();

    enterDashboard();
    showToast("Giriş yapıldı.");
});

$("registerForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const name = $("registerName").value.trim();
    const studentNo = $("registerStudentNo").value.trim();
    const email = $("registerEmail").value.trim().toLowerCase();
    const password = $("registerPassword").value;

    const users = getUsers();

    if (users.some((item) => item.email === email)) {
        showToast("Bu e-posta adresiyle daha önce hesap oluşturulmuş.");
        return;
    }

    users.push({
        name,
        studentNo,
        email,
        password,
        points: 0,
        attendanceCount: 0,
        monthlyPoints: 0,
        monthlyPointsMonth: getCurrentMonthKey(),
        createdAt: new Date().toISOString()
    });

    saveUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, email);
    $("registerForm").reset();

    enterDashboard();
    showToast("Hesabın oluşturuldu.");
});

document.querySelectorAll(".sidebar-link").forEach((button) => {
    button.addEventListener("click", () => {
        showDashboardPanel(button.dataset.panel);
    });
});

document.querySelectorAll("[data-open-levels]").forEach((button) => {
    button.addEventListener("click", () => {
        showDashboardPanel("levelsPanel");
    });
});

function createSeatCode(tableId, seatNumber) {
    return `${tableId}-${String(seatNumber).padStart(2, "0")}`;
}

function getTableById(tableId) {
    return TABLES.find((table) => table.id === tableId);
}

function getSeatReservationSet() {
    if (!$("reservationDate").value || !$("reservationTime").value) {
        return new Set();
    }

    return new Set(
        getReservations()
            .filter((reservation) => {
                return reservation.status === "active" &&
                    reservation.date === $("reservationDate").value &&
                    reservation.time === $("reservationTime").value;
            })
            .map((reservation) => reservation.seatCode)
    );
}

function isSeatOccupied(seatCode) {
    return FIXED_OCCUPIED_SEATS.has(seatCode) || getSeatReservationSet().has(seatCode);
}

function calculateSeatSummary() {
    const totalSeats = TABLES.reduce((sum, table) => sum + table.seats, 0);
    const activeReservations = getReservations().filter((reservation) => reservation.status === "active");
    const occupiedSeats = FIXED_OCCUPIED_SEATS.size + activeReservations.length;
    const availableSeats = Math.max(0, totalSeats - occupiedSeats);
    const occupancyRate = totalSeats === 0 ? 0 : Math.round((occupiedSeats / totalSeats) * 100);

    return {
        totalSeats,
        occupiedSeats,
        availableSeats,
        occupancyRate
    };
}

function renderLandingOccupancyTable() {
    const summary = calculateSeatSummary();

    const rows = [
        {
            area: "Sessiz Çalışma Salonu",
            total: summary.totalSeats,
            available: summary.availableSeats,
            occupied: summary.occupiedSeats
        },
        {
            area: "Bilgisayarlı Çalışma Alanı",
            total: 6,
            available: Math.max(0, 6 - 1),
            occupied: 1
        }
    ];

    $("capacityRateText").textContent = `%${summary.occupancyRate}`;
    $("capacityTotalText").textContent = summary.totalSeats;
    $("capacityAvailableText").textContent = summary.availableSeats;
    $("semiGaugeText").textContent = `%${summary.occupancyRate}`;
    $("semiGaugeFill").style.setProperty("--gauge-angle", `${Math.min(180, summary.occupancyRate * 1.8)}deg`);

    $("landingOccupancyTable").innerHTML = rows.map((row) => {
        const rate = Math.round((row.occupied / row.total) * 100);

        return `
            <tr>
                <td class="occupancy-area-name">${row.area}</td>
                <td>${row.total}</td>
                <td>${row.available}</td>
                <td>${row.occupied}</td>
                <td>
                    <div class="occupancy-rate">
                        <div class="rate-track">
                            <div class="rate-bar" style="width:${rate}%"></div>
                        </div>
                        <span>%${rate}</span>
                    </div>
                </td>
                <td><span class="status-pill">Müsait</span></td>
            </tr>
        `;
    }).join("");
}

function renderMetrics() {
    const summary = calculateSeatSummary();

    $("metricTotalSeats").textContent = summary.totalSeats;
    $("metricAvailableSeats").textContent = summary.availableSeats;
    $("metricOccupiedSeats").textContent = summary.occupiedSeats;
    $("metricOccupancyRate").textContent = `%${summary.occupancyRate}`;
}

function positionSeat(button, index, totalSeats) {
    const upperCount = Math.ceil(totalSeats / 2);
    const lowerCount = Math.floor(totalSeats / 2);

    if (index < upperCount) {
        button.style.left = `${((index + 1) / (upperCount + 1)) * 100}%`;
        button.style.top = "-7px";
    } else {
        const lowerIndex = index - upperCount;

        button.style.left = `${((lowerIndex + 1) / (lowerCount + 1)) * 100}%`;
        button.style.top = "calc(100% + 7px)";
    }
}

function renderFloorPlan() {
    const floorPlan = $("floorPlan");

    floorPlan.querySelectorAll(".table-unit").forEach((table) => table.remove());

    TABLES.forEach((table) => {
        const tableElement = document.createElement("div");

        tableElement.className = "table-unit";

        if (table.computers) {
            tableElement.classList.add("computer-table");
        }

        Object.assign(tableElement.style, {
            left: `${table.x}%`,
            top: `${table.y}%`,
            width: `${table.width}%`,
            height: `${table.height}%`
        });

        const desk = document.createElement("div");

        desk.className = "desk";

        if (table.computers) {
            desk.innerHTML = `
                <div>
                    <div class="computer-icons">${"🖥️".repeat(table.computers)}</div>
                    <small>${table.name}</small>
                </div>
            `;
        } else {
            desk.textContent = table.name;
        }

        tableElement.appendChild(desk);

        for (let index = 0; index < table.seats; index++) {
            const seatNumber = index + 1;
            const seatCode = createSeatCode(table.id, seatNumber);
            const seatButton = document.createElement("button");

            seatButton.type = "button";
            seatButton.className = "seat";
            seatButton.textContent = seatCode;
            seatButton.title = `${table.name} · ${seatCode}`;

            positionSeat(seatButton, index, table.seats);

            if (table.computers && index < table.computers) {
                seatButton.classList.add("computer-seat");
            }

            if (isSeatOccupied(seatCode)) {
                seatButton.classList.add("occupied");
                seatButton.disabled = true;
            } else if (selectedSeatCode === seatCode) {
                seatButton.classList.add("selected");
            } else {
                seatButton.classList.add("available");
            }

            seatButton.addEventListener("click", () => {
                selectedSeatCode = seatCode;
                updateSelectedSeatArea();
                renderFloorPlan();
            });

            tableElement.appendChild(seatButton);
        }

        floorPlan.appendChild(tableElement);
    });
}

function updateSelectedSeatArea() {
    $("selectedSeatText").textContent = selectedSeatCode || "Henüz seçilmedi";

    refreshAvailableTimeOptions();

    const validationError = getReservationValidationError();

    $("createReservationButton").disabled = !(
        selectedSeatCode &&
        !validationError
    );

    if (validationError && ($("reservationDate").value || $("reservationTime").value)) {
        showReservationValidationMessage(validationError);
    } else if (selectedSeatCode) {
        showReservationValidationMessage("Seçimin uygun. Rezervasyonunu oluşturabilirsin.", true);
    } else {
        showReservationValidationMessage("");
    }

    renderReservationAccessBanner();
}

function renderReservationAccessBanner() {
    const banner = $("reservationAccessBanner");

    if (!banner) {
        return;
    }

    const user = getCurrentUser();
    const selectedDate = $("reservationDate").value || getTodayString();
    const sessionCount = getDailySessionCount(selectedDate);
    const blocked = isUserBlocked(user);

    $("dailyQuotaDots").innerHTML = Array.from({ length: MAX_DAILY_SESSIONS }, (_, index) => {
        const stateClass = blocked ? "blocked" : (index < sessionCount ? "used" : "");
        return `<span class="quota-dot ${stateClass}"></span>`;
    }).join("");

    banner.classList.toggle("blocked", blocked);

    if (blocked) {
        const blockedUntil = getBlockedUntilDate(user);

        $("dailyQuotaTitle").textContent = "Yeni rezervasyon erişimin geçici olarak kapalı";
        $("dailyQuotaText").textContent =
            `Katılımı doğrulanmayan seans nedeniyle ${formatDateTime(blockedUntil)} tarihine kadar yeni rezervasyon oluşturamazsın.`;
        return;
    }

    $("dailyQuotaTitle").textContent =
        `${selectedDate} tarihinde ${sessionCount} / ${MAX_DAILY_SESSIONS} seans kullandın`;

    $("dailyQuotaText").textContent =
        sessionCount >= MAX_DAILY_SESSIONS
            ? "Bu gün için maksimum seans sayısına ulaştın."
            : `Bu gün için ${MAX_DAILY_SESSIONS - sessionCount} seans hakkın kaldı.`;
}

$("reservationDate").addEventListener("change", () => {
    selectedSeatCode = null;

    if ($("reservationDate").value < getTodayString()) {
        $("reservationDate").value = "";
        $("reservationTime").value = "";
        showReservationValidationMessage("Geçmiş bir tarihe rezervasyon oluşturamazsın.");
        showToast("Geçmiş bir tarihe rezervasyon oluşturamazsın.");
        refreshAvailableTimeOptions();
        renderFloorPlan();
        return;
    }

    refreshAvailableTimeOptions();
    updateSelectedSeatArea();
    renderFloorPlan();
});

$("reservationTime").addEventListener("change", () => {
    selectedSeatCode = null;

    const selectedDate = $("reservationDate").value;
    const selectedTime = $("reservationTime").value;

    if (selectedDate && selectedTime && isPastSession(selectedDate, selectedTime)) {
        $("reservationTime").value = "";
        showReservationValidationMessage(
            "Bu saat aralığı geçtiği için rezervasyon oluşturamazsın. Lütfen ileri bir saat seç."
        );
        showToast("Geçmiş bir saate rezervasyon oluşturamazsın.");
        renderFloorPlan();
        return;
    }

    if (selectedDate && selectedTime && hasSameSessionReservation(selectedDate, selectedTime)) {
        $("reservationTime").value = "";
        showReservationValidationMessage(
            "Bu saat aralığı için zaten bir koltuk ayırdın. Aynı seansa ikinci bir koltuk seçemezsin."
        );
        showToast("Aynı saate ikinci bir koltuk alamazsın.");
        renderFloorPlan();
        return;
    }

    updateSelectedSeatArea();
    renderFloorPlan();
});

$("createReservationButton").addEventListener("click", () => {
    applyOverdueNoShowPenalties();
    const validationError = getReservationValidationError();

    if (validationError) {
        showToast(validationError);
        showReservationValidationMessage(validationError);
        renderReservationAccessBanner();
        return;
    }

    $("rulesCheckbox").checked = false;
    $("rulesModal").classList.add("show");
});

$("closeRulesModalButton").addEventListener("click", () => {
    $("rulesModal").classList.remove("show");
});

$("rulesModal").addEventListener("click", (event) => {
    if (event.target === $("rulesModal")) {
        $("rulesModal").classList.remove("show");
    }
});

$("confirmReservationButton").addEventListener("click", () => {
    if (!$("rulesCheckbox").checked) {
        showToast("Kuralları kabul etmelisin.");
        return;
    }

    applyOverdueNoShowPenalties();
    const validationError = getReservationValidationError();

    if (validationError) {
        showToast(validationError);
        showReservationValidationMessage(validationError);
        $("rulesModal").classList.remove("show");
        renderReservationAccessBanner();
        return;
    }

    if (!selectedSeatCode || isSeatOccupied(selectedSeatCode)) {
        showToast("Uygun bir koltuk seçmelisin.");
        return;
    }

    const tableId = selectedSeatCode.split("-")[0];
    const table = getTableById(tableId);
    const reservations = getReservations();

    reservations.push({
        id: `R-${Date.now()}`,
        email: getCurrentUserEmail(),
        seatCode: selectedSeatCode,
        tableName: table.name,
        date: $("reservationDate").value,
        time: $("reservationTime").value,
        status: "active",
        attendanceVerified: false,
        createdAt: new Date().toISOString()
    });

    saveReservations(reservations);

    selectedSeatCode = null;
    $("rulesModal").classList.remove("show");

    refreshAvailableTimeOptions();
    updateSelectedSeatArea();
    showReservationValidationMessage("");
    renderFloorPlan();
    renderMetrics();
    renderLandingOccupancyTable();
    renderReservations();
    renderReservationAccessBanner();

    showDashboardPanel("reservationsPanel");
    showToast("Rezervasyon oluşturuldu.");
});

function createStatusChip(reservation) {
    if (reservation.status === "cancelled") {
        return '<span class="status-chip cancelled">İptal Edildi</span>';
    }

    if (reservation.status === "missed") {
        return '<span class="status-chip missed">Katılmadı · -10 Puan</span>';
    }

    if (reservation.status === "invalid") {
        return '<span class="status-chip cancelled">Geçersiz · Ceza Uygulanmadı</span>';
    }

    if (reservation.attendanceVerified) {
        return '<span class="status-chip attended">Katılım Doğrulandı</span>';
    }

    return '<span class="status-chip">Katılım Bekleniyor</span>';
}

function renderReservations() {
    const user = getCurrentUser();

    if (!user) {
        return;
    }

    applyOverdueNoShowPenalties();

    const reservations = getReservations()
        .filter((reservation) => reservation.email === user.email)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const activeReservations = reservations
        .filter((reservation) => reservation.status === "active")
        .sort((a, b) => getReservationStartDate(a) - getReservationStartDate(b));

    if (activeReservations.length === 0) {
        $("activeReservationArea").innerHTML = `
            <div class="empty-state">
                Henüz yaklaşan rezervasyonun bulunmuyor.
            </div>
        `;

        $("locationStatusText").textContent =
            "Katılımını doğrulamak için önce rezervasyon oluşturmalısın.";

        $("attendanceReservationSelect").innerHTML =
            '<option value="">Rezervasyon seç</option>';
    } else {
        $("activeReservationArea").innerHTML = `
            <div class="upcoming-reservation-list">
                ${activeReservations.map((reservation) => `
                    <div class="reservation-summary">
                        ${createStatusChip(reservation)}
                        <strong>${reservation.seatCode} · ${reservation.tableName}</strong>
                        <span>${reservation.date} · ${reservation.time}</span>

                        <button class="button secondary-button cancel-reservation-button"
                            data-reservation-id="${reservation.id}">
                            Rezervasyonu İptal Et
                        </button>
                    </div>
                `).join("")}
            </div>
        `;

        document.querySelectorAll(".cancel-reservation-button").forEach((button) => {
            button.addEventListener("click", () => {
                cancelReservation(button.dataset.reservationId);
            });
        });

        $("attendanceReservationSelect").innerHTML = `
            <option value="">Rezervasyon seç</option>
            ${activeReservations.map((reservation) => `
                <option value="${reservation.id}">
                    ${reservation.date} · ${reservation.time} · ${reservation.seatCode}
                </option>
            `).join("")}
        `;
    }

    if (reservations.length === 0) {
        $("reservationHistoryArea").innerHTML = `
            <div class="empty-state">
                Henüz rezervasyon geçmişin bulunmuyor.
            </div>
        `;
    } else {
        $("reservationHistoryArea").innerHTML = `
            <div class="history-list">
                ${reservations.map((reservation) => `
                    <div class="history-item">
                        <div>
                            <strong>${reservation.seatCode} · ${reservation.tableName}</strong><br>
                            <span>${reservation.date} · ${reservation.time}</span>
                        </div>

                        ${createStatusChip(reservation)}
                    </div>
                `).join("")}
            </div>
        `;
    }

    renderReservationAccessBanner();
    updateSelectedSeatArea();
}
function cancelReservation(reservationId) {
    const confirmed = window.confirm("Rezervasyonunu iptal etmek istediğine emin misin?");

    if (!confirmed) {
        return;
    }

    const reservations = getReservations();
    const reservation = reservations.find((item) => item.id === reservationId);

    if (!reservation) {
        return;
    }

    reservation.status = "cancelled";
    reservation.cancelledAt = new Date().toISOString();

    saveReservations(reservations);

    refreshAvailableTimeOptions();
    renderReservations();
    renderFloorPlan();
    renderMetrics();
    renderLandingOccupancyTable();
    renderReservationAccessBanner();

    showToast("Rezervasyon iptal edildi.");
}

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

function calculateDistanceMeters(latitude1, longitude1, latitude2, longitude2) {
    const earthRadius = 6371000;
    const latitudeDifference = degreesToRadians(latitude2 - latitude1);
    const longitudeDifference = degreesToRadians(longitude2 - longitude1);

    const a =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(degreesToRadians(latitude1)) *
        Math.cos(degreesToRadians(latitude2)) *
        Math.sin(longitudeDifference / 2) ** 2;

    return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getSelectedAttendanceReservation() {
    const reservationId = $("attendanceReservationSelect").value;

    return getActiveReservations().find((reservation) => reservation.id === reservationId) || null;
}

function verifyAttendance(distanceMeters) {
    applyOverdueNoShowPenalties();

    const activeReservation = getSelectedAttendanceReservation();

    if (!activeReservation) {
        showToast("Katılımını doğrulamak istediğin seansı seçmelisin.");
        return;
    }

    if (activeReservation.attendanceVerified) {
        showToast("Bu seans için katılımın daha önce doğrulandı.");
        return;
    }

    const reservations = getReservations();
    const reservation = reservations.find((item) => item.id === activeReservation.id);

    reservation.attendanceVerified = true;
    reservation.attendedAt = new Date().toISOString();
    reservation.distanceMeters = Math.round(distanceMeters);

    saveReservations(reservations);

    const users = getUsers();
    const user = users.find((item) => item.email === reservation.email);

    user.points = (user.points || 0) + 10;
    user.attendanceCount = (user.attendanceCount || 0) + 1;

    ensureMonthlyPoints(user);
    user.monthlyPoints = (user.monthlyPoints || 0) + 10;

    const today = new Date().toISOString().split("T")[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split("T")[0];

    if (user.lastAttendanceDate !== today) {
        if (user.lastAttendanceDate === yesterday) {
            user.streak = (user.streak || 0) + 1;
        } else {
            user.streak = 1;
        }

        user.lastAttendanceDate = today;
    }

    saveUsers(users);

    $("locationStatusText").textContent =
        "Katılımın doğrulandı. Kütüphaneye hoş geldin! (+10 puan)";

    renderReservations();
    renderProfile();
    showToast("Katılım doğrulandı. 10 puan kazandın.");
}

function startLocationTracking() {
    applyOverdueNoShowPenalties();

    if (!getSelectedAttendanceReservation()) {
        showToast("Konum doğrulaması için rezervasyon seçmelisin.");
        return;
    }

    if (!navigator.geolocation) {
        showToast("Tarayıcın konum özelliğini desteklemiyor.");
        return;
    }

    $("locationStatusText").textContent = "Konum kontrol ediliyor...";

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const distanceMeters = calculateDistanceMeters(
                position.coords.latitude,
                position.coords.longitude,
                LIBRARY_LOCATION.latitude,
                LIBRARY_LOCATION.longitude
            );

            if (distanceMeters <= LIBRARY_LOCATION.radiusMeters) {
                verifyAttendance(distanceMeters);
            } else {
                $("locationStatusText").textContent =
                    `Şu anda kütüphane alanının yaklaşık ${Math.round(distanceMeters)} metre dışındasın.`;
            }
        },
        () => {
            $("locationStatusText").textContent =
                "Konum bilgisi alınamadı. Tarayıcıdan konum izni vermelisin.";
        },
        {
            enableHighAccuracy: true,
            timeout: 12000
        }
    );
}

$("startLocationButton").addEventListener("click", startLocationTracking);

$("demoLocationButton").addEventListener("click", () => {
    verifyAttendance(12);
});

function getCurrentLevel(points) {
    let currentLevel = LEVELS[0];

    LEVELS.forEach((level) => {
        if (points >= level.minPoints) {
            currentLevel = level;
        }
    });

    return currentLevel;
}

function getNextLevel(points) {
    return LEVELS.find((level) => level.minPoints > points) || null;
}

function getCurrentRank(points) {
    let currentRank = RANKS[0];

    RANKS.forEach((rank) => {
        if (points >= rank.minPoints) {
            currentRank = rank;
        }
    });

    return currentRank;
}

function getNextRank(points) {
    return RANKS.find((rank) => rank.minPoints > points) || null;
}

function renderMonthlyLeaderboard(user) {
    const monthlyPoints = ensureMonthlyPoints(user);

    const leaderboard = [
        ...DEMO_MONTHLY_LEADERBOARD.map((item) => ({
            ...item,
            isCurrentUser: false
        })),
        {
            name: user.name,
            monthlyPoints,
            isCurrentUser: true
        }
    ].sort((a, b) => {
        if (b.monthlyPoints !== a.monthlyPoints) {
            return b.monthlyPoints - a.monthlyPoints;
        }

        return a.name.localeCompare(b.name, "tr");
    });

    const currentUserIndex = leaderboard.findIndex((item) => item.isCurrentUser);
    const currentUserRank = currentUserIndex + 1;
    const thirdPlacePoints = leaderboard[2] ? leaderboard[2].monthlyPoints : 0;
    const pointsToTopThree = Math.max(0, thirdPlacePoints - monthlyPoints + (currentUserRank > 3 ? 10 : 0));

    $("monthlyRankText").textContent = `#${currentUserRank}`;
    $("monthlyPointsText").textContent = `${monthlyPoints} XP`;
    $("leaderboardParticipantCount").textContent = leaderboard.length;
    $("pointsToTopThree").textContent = currentUserRank <= 3 ? "İlk 3'tesin" : `${pointsToTopThree} XP`;

    $("leaderboardTable").innerHTML = leaderboard.map((item, index) => `
        <div class="leaderboard-row ${item.isCurrentUser ? "current-user" : ""}">
            <div class="leaderboard-position">
                ${index < 3 ? ["🥇", "🥈", "🥉"][index] : `#${index + 1}`}
            </div>

            <div class="leaderboard-person">
                <strong>${item.name}${item.isCurrentUser ? " · Sen" : ""}</strong>
                <span>${item.isCurrentUser ? "Aylık performansın" : "Öğrenci"}</span>
            </div>

            <div class="leaderboard-points">${item.monthlyPoints} XP</div>
        </div>
    `).join("");
}

function renderProfile() {
    const user = getCurrentUser();

    if (!user) {
        return;
    }

    const points = user.points || 0;
    const attendanceCount = user.attendanceCount || 0;
    const streak = user.streak || 0;
    const currentLevel = getCurrentLevel(points);
    const nextLevel = getNextLevel(points);
    const currentRank = getCurrentRank(points);
    const nextRank = getNextRank(points);
    const levelDetail = LEVEL_DETAILS[currentLevel.name];

    renderMonthlyLeaderboard(user);

    $("profileName").textContent = user.name;
    $("profileEmail").textContent = user.email;
    $("profileLevelMiniBadge").textContent = currentLevel.name;

    $("profileDetails").innerHTML = `
        <p><b>Ad soyad:</b> ${user.name}</p>
        <p><b>Öğrenci numarası:</b> ${user.studentNo}</p>
        <p><b>E-posta:</b> ${user.email}</p>
        <p><b>Toplam puan:</b> ${points} XP</p>
        <p><b>Doğrulanan katılım:</b> ${attendanceCount}</p>
        <p><b>Çalışma serisi:</b> ${streak} gün 🔥</p>
        <p><b>Günlük seans sınırı:</b> ${MAX_DAILY_SESSIONS}</p>
    `;

    if (isUserBlocked(user)) {
        $("penaltyInfoBox").className = "penalty-info-box";
        $("penaltyInfoBox").innerHTML = `
            <b>⚠️ Geçici erişim engeli</b><br>
            Katılımı doğrulanmayan seans nedeniyle ${formatDateTime(getBlockedUntilDate(user))}
            tarihine kadar yeni rezervasyon oluşturamazsın.
        `;
    } else {
        $("penaltyInfoBox").className = "penalty-info-box clear";
        $("penaltyInfoBox").innerHTML = `
            <b>✓ Aktif cezan bulunmuyor</b><br>
            Katılımını doğrulamayı unutma. Katılmadığın seanslar için -10 puan ve 2 günlük erişim engeli uygulanır.
        `;
    }

    const badges = [
        { icon: "🌱", name: "İlk Adım", unlocked: attendanceCount >= 1 },
        { icon: "📖", name: "Düzenli Okur", unlocked: attendanceCount >= 3 },
        { icon: "🔕", name: "Sessizlik Ustası", unlocked: attendanceCount >= 5 },
        { icon: "🏆", name: "Kütüphane Müdavimi", unlocked: attendanceCount >= 10 }
    ];

    $("badgeArea").innerHTML = badges.map((badge) => `
        <div class="badge ${badge.unlocked ? "unlocked" : ""}">
            <span>${badge.icon}</span>
            <span>${badge.name}</span>
        </div>
    `).join("");

    // Seviyeler sekmesi: mevcut seviye
    $("levelHeroIcon").textContent = levelDetail.icon;
    $("levelHeroName").textContent = currentLevel.name;
    $("levelHeroMessage").textContent = levelDetail.message;
    $("levelTotalPoints").textContent = `${points} XP`;
    $("levelAttendanceCount").textContent = attendanceCount;

    if (nextLevel) {
        const range = nextLevel.minPoints - currentLevel.minPoints;
        const earnedInCurrentLevel = points - currentLevel.minPoints;
        const percentage = Math.min(100, Math.max(0, (earnedInCurrentLevel / range) * 100));

        $("nextLevelName").textContent = nextLevel.name;
        $("levelMainProgressBar").style.width = `${percentage}%`;
        $("levelMainProgressText").textContent = `${earnedInCurrentLevel} / ${range} puan`;
        $("levelNextHint").textContent =
            `${nextLevel.name} seviyesine ${nextLevel.minPoints - points} puan kaldı.`;
    } else {
        $("nextLevelName").textContent = "En yüksek seviye";
        $("levelMainProgressBar").style.width = "100%";
        $("levelMainProgressText").textContent = `${points} XP`;
        $("levelNextHint").textContent = "Tebrikler, bütün seviyelerin kilidini açtın.";
    }

    $("levelJourney").innerHTML = LEVELS.map((level, index) => {
        const detail = LEVEL_DETAILS[level.name];
        const isCompleted = points >= level.minPoints;
        const isCurrent = level.name === currentLevel.name;
        const stateClass = isCurrent ? "current" : (isCompleted ? "completed" : "locked");
        const stateText = isCurrent ? "Şu an buradasın" : (isCompleted ? "Tamamlandı" : `${level.minPoints} XP gerekli`);

        return `
            <article class="level-step ${stateClass}">
                <div class="level-step-icon">${detail.icon}</div>

                <div class="level-step-copy">
                    <span>SEVİYE ${index + 1}</span>
                    <h4>${level.name}</h4>
                    <p>${detail.message}</p>
                </div>

                <div class="level-step-state">${stateText}</div>
            </article>
        `;
    }).join("");

    // Çalışma serisi
    $("streakCount").textContent = streak;

    const days = ["P", "S", "Ç", "P", "C", "C", "P"];

    $("streakWeek").innerHTML = days.map((day, index) => `
        <div class="streak-day ${index < Math.min(streak, 7) ? "active" : ""}">
            ${index < Math.min(streak, 7) ? "🔥" : day}
        </div>
    `).join("");

    // Rank kartı
    $("rankTitle").textContent = currentRank.name;
    $("rankIcon").textContent = currentRank.icon;

    if (nextRank) {
        const range = nextRank.minPoints - currentRank.minPoints;
        const progress = Math.min(100, Math.max(0, ((points - currentRank.minPoints) / range) * 100));

        $("rankProgressBar").style.width = `${progress}%`;
        $("rankProgressText").textContent =
            `${nextRank.name} rankına ${nextRank.minPoints - points} puan kaldı.`;
        $("rankMessage").textContent =
            `Her doğrulanmış katılım seni ${nextRank.name} rankına yaklaştırır.`;
    } else {
        $("rankProgressBar").style.width = "100%";
        $("rankProgressText").textContent = "En yüksek ranka ulaştın.";
        $("rankMessage").textContent = "Kütüphanenin en yüksek rankına ulaştın.";
    }

    $("rankJourney").innerHTML = RANKS.map((rank) => `
        <div class="rank-step ${rank.name === currentRank.name ? "current" : ""}">
            <div class="rank-step-icon">${rank.icon}</div>

            <div>
                <b>${rank.name}</b><br>
                <small>${rank.minPoints} puan</small>
            </div>
        </div>
    `).join("");
}

const today = new Date().toISOString().split("T")[0];
$("reservationDate").min = today;

refreshAvailableTimeOptions();
updateHeader();
renderLandingOccupancyTable();

if (getCurrentUser()) {
    $("signedInActions").classList.remove("hidden");
}
