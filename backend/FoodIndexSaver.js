function updateStuff() {
    goalProt = parseInt(document.getElementById('proGoalInput').value) || 140;
    goalCal = parseInt(document.getElementById('kcalGoalInput').value) || 3000;
    
    localStorage.setItem('goalProt', goalProt);
    localStorage.setItem('goalCal', goalCal);
    
    document.getElementById('proGoal').innerText = goalProt + "g Protein";
    document.getElementById('kcalGoal').innerText = goalCal + " kcal";
    
    updateUI();
    closeSettings();
}

let goalProt = 140;
let goalCal = 3000;

let totalProt = 0;
let totalCal = 0;

let mealHistory = JSON.parse(localStorage.getItem('meals')) || [];

window.onload = function() {
    checkNewDay();
    initUI();
};

function initUI() {
    goalProt = parseInt(localStorage.getItem('goalProt')) || 140;
    goalCal = parseInt(localStorage.getItem('goalCal')) || 3000;
    
    document.getElementById('proGoal').innerText = goalProt + "g Protein";
    document.getElementById('kcalGoal').innerText = goalCal + " kcal";
    
    document.getElementById('proGoalInput').value = goalProt;
    document.getElementById('kcalGoalInput').value = goalCal;
    
    loadFromDatabase();
}

function checkNewDay() {
    const heute = new Date().toDateString();
    const letzterTag = localStorage.getItem('lastDate');

    if (letzterTag !== heute) {
        mealHistory = [];
        localStorage.setItem('meals', JSON.stringify([]));
        localStorage.setItem('lastDate', heute);
    }
}

function updateUI() {
    document.getElementById('proteinText').innerText = totalProt;
    document.getElementById('caloriesText').innerText = totalCal;

    const protPercent = Math.min((totalProt / goalProt) * 360, 360);
    const calPercent = Math.min((totalCal / goalCal) * 360, 360);

    document.getElementById('proteinCircle').style.background = `conic-gradient(#Fd005F ${protPercent}deg, #79797961 0deg)`;
    document.getElementById('caloriesCircle').style.background = `conic-gradient(#4dff88 ${calPercent}deg, #79797961 0deg)`;
    
    localStorage.setItem('meals', JSON.stringify(mealHistory));
}

function loadFromDatabase() {
    totalProt = 0;
    totalCal = 0;
    document.getElementById('mealList').innerHTML = "";

    mealHistory.forEach(meal => {
        renderMealToList(meal.id, meal.time, meal.name, meal.prot, meal.cal);
        totalProt += meal.prot;
        totalCal += meal.cal;
    });
    updateUI();
}

function renderMealToList(id, time, name, prot, cal) {
    const li = document.createElement('li');
    li.setAttribute('data-id', id);
    li.innerHTML = `
        <span class="foodlist"><strong>${time}</strong> - ${name}: ${prot}g / ${cal}kcal</span>
        <button class="delete-btn" onclick="removeMeal(this, ${prot}, ${cal})"><i class="fi fi-br-cross"></i></button>
    `;
    document.getElementById('mealList').appendChild(li);
}

function addFood() {
    const nameInput = document.getElementById('foodName').value.toLowerCase().trim();
    const dropdown = document.getElementById('dropdown');
    const grammIn = document.getElementById('grammIn');

    let prot = 0;
    let cal = 0;

    if (FoodDatabase[nameInput]) {
        prot = FoodDatabase[nameInput].prot;
        cal = FoodDatabase[nameInput].cal;

        if (dropdown.value === 'per100g') {
            const gramm = parseFloat(grammIn.value) || 100;
            prot = (prot / 100) * gramm;
            cal = (cal / 100) * gramm;
            
            prot = Math.round(prot * 10) / 10;
            cal = Math.round(cal);
        }
    } else {
        alert("Nicht gefunden!");
        return;
    }

    saveToHistory(nameInput.charAt(0).toUpperCase() + nameInput.slice(1), prot, cal);
    document.getElementById('foodName').value = "";
}

function addManual() {
    const p = parseInt(document.getElementById('foodProt').value) || 0;
    const c = parseInt(document.getElementById('foodCal').value) || 0;
    if (p === 0 && c === 0) return;
    saveToHistory("Manuell", p, c);
    document.getElementById('foodProt').value = "";
    document.getElementById('foodCal').value = "";
}

function saveToHistory(name, prot, cal) {
    const jetzt = new Date();
    const time = jetzt.getHours() + ":" + jetzt.getMinutes().toString().padStart(2, '0');
    const id = Date.now();

    const meal = { id, time, name, prot, cal };
    mealHistory.push(meal);
    
    totalProt += prot;
    totalCal += cal;

    renderMealToList(id, time, name, prot, cal);
    updateUI();
}

function removeMeal(btn, p, c) {
    const li = btn.parentElement;
    const id = parseInt(li.getAttribute('data-id'));
    mealHistory = mealHistory.filter(m => m.id !== id);
    totalProt -= p;
    totalCal -= c;
    li.remove();
    updateUI();
}

function openSettings() {
    const settingsFrame = document.querySelector(".settingsframe");
    const settingsBtn = document.querySelector(".btnSettings");

    if (!settingsFrame) return;
    settingsFrame.style.display = "block";  

    settingsBtn.onclick = closeSettings; 

    setTimeout(() => {
        settingsBtn.classList.add("is-open");
        settingsFrame.classList.add("is-open");
    }, 10);
}

function closeSettings() {
    const settingsFrame = document.querySelector(".settingsframe");
    const settingsBtn = document.querySelector(".btnSettings");

    if (!settingsFrame) return;
    settingsFrame.classList.remove("is-open");
     if (!settingsBtn) return;
    settingsBtn.classList.remove("is-open");

    settingsBtn.onclick = openSettings; 

    setTimeout(() => {
        settingsFrame.style.display = "none";
    }, 200);
}
