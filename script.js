import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js"; 


// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAJSndMqGuEUJL5l8VjOA-TRY4BXphw6Fo",
  authDomain: "planning-villa-paisible.firebaseapp.com",
  projectId: "planning-villa-paisible",
  storageBucket: "planning-villa-paisible.firebasestorage.app",
  messagingSenderId: "331542979083",
  appId: "1:331542979083:web:613e41b1224fa7b296dd0e",
  measurementId: "G-DGVS4W490M"
};
// Initialisation de Firebase
const appl = initializeApp(firebaseConfig);
const db = getFirestore(appl);


const testDocRef = doc(db, "testCollection", "testDoc");


console.log("ici4")
getDoc(testDocRef)
  .then(docSnap => {
    if (docSnap.exists()) {
      console.log("Doc data:", docSnap.data());
    } else {
      console.log("No such document!");
    }
  })
  .catch(error => {
    console.error("Erreur Firestore:", error);
  });
  console.log("ici5")


const selectingContract = {
  i:null,
  activate : false,
  name : null,
  start  : null,
  end  : null,
  app : null,
  loyer : null,
  taxeDeSejour : null,
  NbAdulte : null,
  NbEnfant : null,
  description : null,
  RBNB : null
};

let app
let manageContract=false;
let newContract = false;
const nbAppartements = 7;


const taskForm = document.getElementById("task-form");
const nameInput = document.getElementById("title-input");
const appInput = document.getElementById("app-input");
const startDateInput = document.getElementById("date-input-start")
const endDateInput = document.getElementById("date-input-end")
const nbAdultInput =document.getElementById("adult-input")
const nbChildInput =document.getElementById("child-input")
const RBNBInput=document.getElementById("oui")
const RBNBInputNo=document.getElementById("non")
const descriptionInput =document.getElementById("description-input")
const loyerInput=document.getElementById("loyer-input")
const closeFormButton= document.getElementById("close-task-form-btn")
closeFormButton.addEventListener("click",()=>{newContract=false;closeForm();document.getElementById("btn").innerText = "Ajouter Contrat";})


const addButton=document.getElementById("add-or-update-task-btn")
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("btn").innerText = "Ajouter Contrat";
  newContract=false
  addContract();

});
let YEAR = 2025;
let selectedHld=false;
function generatePlanning(year) {
  YEAR = year;
  const planningContainer = document.getElementById("planning");
  planningContainer.innerHTML = `
    <h2>Planning ${year}</h2>
    <div class="add-contract-div">
      <button type="button" class="add-contract-button" id="btn">Ajouter contrat</button>
      <button type="button" class="add-contract-button" id="btn-hld">Ajouter Vacances/Jour fériés</button>
      <button type="button" class="add-contract-button" id="btn-excel">Télécharger Excel</button>
      <p id="result" class="add-contract-info"></p>
      <button id="delete-contract-btn" class="add-contract-button hidden">Supprimer</button>
      <button id="modify-contract-btn" class="add-contract-button hidden">Modifier</button>
    </div>
    <div id="total-annee"></div>`;

  const button = document.getElementById("btn");
  const buttonHld = document.getElementById("btn-hld");
  const result = document.getElementById("result");
  const deleteContractBtn = document.getElementById("delete-contract-btn");
  const modifyContractBtn = document.getElementById("modify-contract-btn");

  const Excel=document.getElementById("btn-excel")
  Excel.addEventListener("click",generateExcel)
  document.getElementById("total-annee").setAttribute("Classic","0");
  document.getElementById("total-annee").setAttribute("RBNB","0");
  deleteContractBtn.addEventListener("click", () => {
    deleteContract();
    updateDisplay();
  });

  modifyContractBtn.addEventListener("click", () => {
    modifyContract();
    updateDisplay();
  });

  button.addEventListener("click", () => {

    if (newContract) {

      button.innerText = "Ajouter Contrat";
      result.innerText = "Nouveau contrat annulé";
      newContract = false;
      closeForm()
      
      return;
    }
    deleteContractBtn.classList.add("hidden");
    modifyContractBtn.classList.add("hidden");
    reset()
    button.innerText = "Annuler";
    newContract = true;
    selectingContract.activate = true;
    app = selectingContract.app;
    result.innerText = "Cliquez d'abord sur la date de début, puis sur la date de fin dans le planning.";
  });

  buttonHld.addEventListener("click", () => {
    if (selectedHld) {
      buttonHld.innerText = "Mettre à jour Vacances/Jour férié";
      result.innerText = "";
      selectedHld = false;
    } else {
      result.innerText = "Cliquez sur les jours fériés.";
      selectedHld = true;
      buttonHld.innerText = "Terminer";
    }
  });

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const dayNames = ["D", "L", "M", "M", "J", "V", "S"];
  

  for (let m = 0; m < 13; m++) {
    const month=m%12;
    const daysInMonth = new Date(year+Math.floor(m/12), month + 1, 0).getDate();
    const monthDiv = document.createElement("div");
    monthDiv.classList.add("month");

    const titleContainer = document.createElement("div");
    titleContainer.style.display = "flex";
    titleContainer.style.alignItems = "center";
    titleContainer.style.justifyContent = "space-between";

    const title = document.createElement("h2");
    title.classList.add("month-table");
    title.textContent = monthNames[month]+` ${year+Math.floor(m/12)}`;
    titleContainer.appendChild(title);
    monthDiv.appendChild(titleContainer);

    const weeks = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year+Math.floor(m/12), month, day);
      let week = getWeekNumber(date);
      
      if (week > 6 && month === 0) week = 0;
      if (week < 6 && month === 11) week = 60;
      if (!weeks[week]) weeks[week] = [];
      weeks[week].push({ date, day });
    }
    
    const table = document.createElement("table");
    table.classList.add("month-table");
    const thead = document.createElement("thead");

    // Ligne des numéros de semaine
    const weekRow = document.createElement("tr");
    weekRow.appendChild(document.createElement("th"));
    Object.keys(weeks).forEach(week => {
      const isFull=weeks[week][weeks[week].length-1].date.getDay()===0;
      const th = document.createElement("th");
      th.colSpan = weeks[week].length ; // +2 pour colonnes jaune et orange
      if (isFull){th.colSpan+=2}
      th.textContent = `Semaine ${week > 0 && week < 60 ? week :getWeekNumber(new Date(year, 0, 1))}`;
      weekRow.appendChild(th);
    });
    const totalMonthHead=createColorColumn("white")
    totalMonthHead.innerText="Total du Mois"
    weekRow.append(totalMonthHead)
    thead.appendChild(weekRow);

    // Ligne des noms de jours
    const daysRow = document.createElement("tr");
    daysRow.appendChild(document.createElement("th"));
    Object.keys(weeks).forEach(week => {
      const isFull=weeks[week][weeks[week].length-1].date.getDay()===0;
      weeks[week].forEach(dayObj => {
        const th = document.createElement("th");
        const jsDay = dayObj.date.getDay();
        th.textContent = dayNames[jsDay];
        daysRow.appendChild(th);
      });
      
      if (isFull){
      daysRow.appendChild(createColorColumn("yellow"));
      daysRow.appendChild(createColorColumn("orange"));
      }
    });
    const totalMonthClassic=createColorColumn("white")
    totalMonthClassic.value=0
    totalMonthClassic.innerText=`Normal : ${0}`
    totalMonthClassic.id=`totalClassic-${month}-${year+Math.floor(m/12)}`
    totalMonthClassic.classList.add("month-total")
    
    daysRow.append(totalMonthClassic)
    thead.appendChild(daysRow);

    // Ligne des numéros de jour
    const numbersRow = document.createElement("tr");
    numbersRow.appendChild(document.createElement("th"));
    Object.keys(weeks).forEach(week => {
            const isFull=weeks[week][weeks[week].length-1].date.getDay()===0;

      weeks[week].forEach(dayObj => {
        const th = document.createElement("th");

        th.textContent = dayObj.day;
        th.isDayOff = false;
        th.id = `${dayObj.day}-${week}-${year+Math.floor(m/12)}`;
        th.addEventListener("click", () => {

          if (selectedHld) {
  const docRef = doc(db, "jours_feries", `DayOff-${YEAR}`);

  getDoc(docRef)
    .then((docSnap) => {
      let listDayOff = [];

      if (docSnap.exists()) {
        listDayOff = docSnap.data().listDayOff || [];
        console.log("Jours fériés récupérés :", listDayOff);
      } else {
        console.log("Aucun jour férié trouvé pour cette année");
      }

      if (listDayOff.includes(th.id)) {
        listDayOff = listDayOff.filter(day => day !== th.id);
      } else {
        listDayOff.push(th.id);
      }

      setDoc(docRef, { listDayOff })
        .then(() => {
          console.log(`Liste des jours fériés ${YEAR} sauvegardée`);
          updateDisplay();
        })
        .catch((error) => {
          console.error("Erreur sauvegarde :", error);
        });
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération :", error);
    });
}


        });
        numbersRow.appendChild(th);
      });
      
      if (isFull){
      numbersRow.appendChild(createColorColumn("yellow"));
      numbersRow.appendChild(createColorColumn("orange"));
    }
    });
    const totalMonthRBNB=createColorColumn("white")
    totalMonthRBNB.value=0
    totalMonthRBNB.innerText=`RBNB : ${0}`
    totalMonthRBNB.id=`totalRBNB-${month}-${year+Math.floor(m/12)}`
    totalMonthRBNB.classList.add("month-total-RBNB")
    numbersRow.append(totalMonthRBNB)
    thead.appendChild(numbersRow);
    
    table.appendChild(thead);

    // Corps du tableau (par appartement)
    const tbody = document.createElement("tbody");

    for (let ap = 1; ap <= nbAppartements; ap++) {
      const tr = document.createElement("tr");
      const label = document.createElement("td");
      label.textContent = `AP.${ap}`;
      tr.appendChild(label);
      
      Object.keys(weeks).forEach(week => {
        const isFull=weeks[week][weeks[week].length-1].date.getDay()===0;

        weeks[week].forEach(dayObj => {
          const td = document.createElement("td");
          td.classList.add("day-cell");
          td.dataset.date = `${dayObj.day}/${month + 1}/${year+Math.floor(m/12)}`;
          td.id = `${new Date(year+Math.floor(m/12), month, dayObj.day).toLocaleDateString()}--app${ap}`;
          td.names = [];
          td.isStart = false;
          td.isEnd = false;
          td.style.background = "white";
          td.isPlanning=true;

          td.addEventListener("click", () => {
            const clickedDate = new Date(year+Math.floor(m/12), month, dayObj.day);
            if (selectingContract.activate) {
              if (!selectingContract.start) {
                if (td.names.length >= 1 && !td.isEnd) {
                  result.innerText = `Début impossible, déjà réservé : ${td.names}`;
                } else {
                  selectingContract.start = clickedDate;
                  selectingContract.app = ap;
                  result.innerText = `Début : ${selectingContract.start.toLocaleDateString()} / AP.${ap}`;
                }
              } else if (!selectingContract.end) {
                if (clickedDate >= selectingContract.start && ap === selectingContract.app) {
                  if (td.names.length >= 1 && !td.isStart) {
                    result.innerText = `Fin impossible, déjà réservé : ${td.names}`;
                  } else {
                    selectingContract.end = clickedDate;
                    startDateInput.value = formatDateToInput(selectingContract.start);
                    endDateInput.value = formatDateToInput(selectingContract.end);
                    appInput.value = ap;
                    result.innerText = `Fin : ${selectingContract.end.toLocaleDateString()}`;
                    taskForm.classList.remove("hidden");
                    addButton.innerText = "Valider";
                  }
                } else {
                  alert(`Date de fin invalide (même appart (${selectingContract.app}) et après le début)`);
                }
              }
            } else if (td.names.length > 0) {
              
              const docRef = doc(db, "Contrats", `contracts-${YEAR}`);

              getDoc(docRef)
                .then((docSnap) => {
                  if (docSnap.exists()) {
                    const saveContract = docSnap.data().listContract;
                    console.log("Contrats récupérés :", saveContract);

                    updateSelectingContract(saveContract.find(contract => contract.id === td.names[0]));
                    deleteContractBtn.classList.remove("hidden");
                    modifyContractBtn.classList.remove("hidden");

                    result.innerText = `Locataires : ${selectingContract.name} ${selectingContract.RBNB ? `(RBNB)` : ""}\n`;
                    result.innerText += `Nombre d'adulte :${selectingContract.NbAdulte} ${Number(selectingContract.NbEnfant) > 0 ? `| Nombre d'enfant ${selectingContract.NbEnfant}` : ''} \n`;
                    result.innerText += `Loyer : ${selectingContract.loyer} | Taxe de séjour ${selectingContract.taxeDeSejour}\n`;
                    result.innerText += `Date : du ${selectingContract.start} au ${selectingContract.end}\n`;
                    result.innerText += `Remarque : ${selectingContract.description}`;
                  } else {
                    console.log("Aucun contrat trouvé pour cette année");
                  }
                })
                .catch((error) => {
                  console.error("Erreur lors de la récupération :", error);
                });


            }
          });

          tr.appendChild(td);
        });
        
        if (isFull){
        const totalWeekApp=createColorColumn("yellow",week,ap,year+Math.floor(m/12))
        totalWeekApp.classList.add("total")
        tr.appendChild(totalWeekApp)
        
        const totalWeekAppRBNB=createColorColumn("orange",week,ap,year+Math.floor(m/12))
        totalWeekAppRBNB.classList.add("total")
        tr.appendChild(totalWeekAppRBNB);
        }
      });
      
      tbody.appendChild(tr);
    }

      const ap="";
      const tr = document.createElement("tr");
      const label = document.createElement("td");
      label.textContent = `Total`;
      tr.appendChild(label);
      label.style.border="none"
      Object.keys(weeks).forEach(week => {
        const isFull=weeks[week][weeks[week].length-1].date.getDay()===0;
        weeks[week].forEach(dayObj => {
          const td = document.createElement("td");
          td.style.border="none"
          tr.appendChild(td);
        });
        
        if(isFull){
        
        const totalYellow=createColorColumn("yellow")
        totalYellow.innerText=0
        totalYellow.id=`total-yellow-${week}-${year+Math.floor(m/12)}`
        totalYellow.classList.add("total")
        const totalOrange=createColorColumn("orange")
        totalOrange.innerText=0
        totalOrange.id=`total-orange-${week}-${year+Math.floor(m/12)}`
        totalOrange.classList.add("total")
        tr.appendChild(totalYellow);
        tr.appendChild(totalOrange);
        }
        
        
      });
    
    tbody.appendChild(tr);
    table.appendChild(tbody);
    
    monthDiv.appendChild(table);
    planningContainer.appendChild(monthDiv);
    

  }

  updateDisplay();

  function createColorColumn(color,week,app,year) {
    
    const td = document.createElement("td");
    td.classList.add("color-column");
    td.style.backgroundColor = color;
    
    td.style.position = "relative";
    td.style.boxSizing="border-box";
    if (week){
      td.id=`week-${week}app-${app}-color${color}-${year}`;
    }
    

    return td;
  }
}






function getWeekNumber(date) {
  // Copie de la date pour ne pas la modifier
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  // Obtenir le jour de la semaine (0 = dimanche, 1 = lundi, ..., 6 = samedi)
  const jour = d.getUTCDay();

  // Ajuster au jeudi de la semaine actuelle (ISO 8601 dit : semaine contenant le jeudi)
  d.setUTCDate(d.getUTCDate() + 4 - (jour === 0 ? 7 : jour));

  // Date du premier jour de l’année
  const debutAnnee = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  // Calcul du numéro de semaine
  const numeroSemaine = Math.ceil((((d - debutAnnee) / 86400000) + 1) / 7);

  return numeroSemaine;
}




const reset =()=>{
  selectingContract.activate =false;
  selectingContract.name=null;
  selectingContract.id=null;
  selectingContract.start =null;
  selectingContract.end =null;
  selectingContract.loyer =null;
  selectingContract.taxeDeSejour =null;
  selectingContract.NbAdulte =null;
  selectingContract.NbEnfant =null;
  selectingContract.description =null;
  selectingContract.RBNB =null;
  selectingContract.app=null;
};

const resetForm =()=>{
  document.getElementById('title-input').value = '';
  document.getElementById('date-input-start').value = '';
  document.getElementById('date-input-end').value = '';
  document.getElementById('adult-input').value = '';
  document.getElementById('child-input').value = '';
  document.getElementById('loyer-input').value = '';
  document.getElementById('description-input').value = ''; // Si ce champ existe

  // Réinitialise le select
  document.getElementById('taxe').selectedIndex = 0;
}

function formatDateToInput(date) {
  const d = new Date(date); // Assure-toi que c’est bien un objet Date
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

startDateInput.value = formatDateToInput(selectingContract.start);
endDateInput.value = formatDateToInput(selectingContract.end);


const addContract=()=>{


  selectingContract.app=appInput.value;
  selectingContract.name = nameInput.value,
  selectingContract.id= `${nameInput.value}-${new Date()}`
  selectingContract.start = startDateInput.value,
  selectingContract.end = endDateInput.value,
  selectingContract.loyer = loyerInput.value,
  selectingContract.NbAdulte = nbAdultInput.value,
  selectingContract.NbEnfant = nbChildInput.value,
  selectingContract.description = descriptionInput.value,
  selectingContract.RBNB = RBNBInput.checked,
  selectingContract.app=appInput.value;
  selectingContract.taxeDeSejour = calcTax(selectingContract)
  console.log(calcTax(selectingContract),selectingContract.app)
  result.innerText=`${addButton.innerText==="Modifier"? "Contrat modifier : " : "Ajout d'un contrat : "} ${selectingContract.name}`

  

  saveContractForYear(YEAR, selectingContract);
  
  closeForm();



}


const updateSelectingContract = (contract)=>{
  selectingContract.activate=true;
  selectingContract.name = contract.name;
  selectingContract.id=contract.id
  selectingContract.start = contract.start;
  selectingContract.end = contract.end;
  selectingContract.app= contract.app;
  selectingContract.loyer = contract.loyer;
  selectingContract.taxeDeSejour =contract.taxeDeSejour;
  selectingContract.NbAdulte = contract.NbAdulte;
  selectingContract.NbEnfant =contract.NbEnfant;
  selectingContract.description = contract.description;
  selectingContract.RBNB = contract.RBNB;
};

function saveContractForYear(year, newContract) {
  // 1. Charger les contrats existants
  
const docRef = doc(db, "Contrats", `contracts-${year}`);

getDoc(docRef)
  .then((docSnap) => {
    if (docSnap.exists()) {
      const contracts = docSnap.data().listContract || [];
      console.log("Contrats récupérés :", contracts);

      // Ajouter le nouveau contrat
      contracts.push(newContract);

      // Réécrire dans Firestore
      return setDoc(docRef, { listContract: contracts });
    } else {
      console.log("Aucun contrat trouvé pour cette année, création du premier.");
      
      // Si aucun document n'existe, on en crée un avec le nouveau contrat
      return setDoc(docRef, { listContract: [newContract] });
    }
  })
  .then(() => {
    console.log(`Liste des contrats ${year} sauvegardée`);
  })
  .catch((error) => {
    console.error("Erreur lors de la récupération ou de la sauvegarde :", error);
  });


}





const closeForm=()=>{

  taskForm.classList.add("hidden");
  resetForm();
  updateDisplay();
  reset();

}


const plotIncome=(contract)=>{
    const color=contract.RBNB? "yellow" : "orange"
    const year = new Date(contract.start).getFullYear()
  cell=document.getElementById(`week-${getWeekNumber(new Date(contract.start))}app-${contract.app}-color${color}-${year}`)
  if (cell){
  cell.innerText=contract.loyer;}
}

const updateDisplay = () => {
    const week=getWeekNumber(new Date())
    const day=new Date().getDate()
    const year=new Date().getFullYear()
    
    if(document.getElementById(`${day}-${week}-${year}`)){
      
        document.getElementById(`${day}-${week}-${year}`).style.border="3px solid red"
  
    }
    resetAllTh();
    resetTotal();

console.log("ici3",db)  
const contractsRef = doc(db, "Contrats", `contracts-${YEAR}`);
const holidaysRef = doc(db, "jours_feries", `DayOff-${YEAR}`);
console.log(contractsRef)
// --- 1. Charger les contrats ---
getDoc(contractsRef)
  .then((docSnap) => {
    if (docSnap.exists()) {
      const listContract = docSnap.data().listContract || [];
      console.log("Contrats récupérés :", listContract);

      listContract.forEach((contract) => {
        const color = contract.RBNB ? "yellow" : "yellow"; // même couleur ?
        const app = contract.app;
        const name = contract.id;

        let day = new Date(contract.start);
        const end = new Date(contract.end);

        while (day <= end) {
          const dayStr = day.toLocaleDateString('fr-FR');
          const id = `${dayStr}--app${app}`;
          const cell = document.getElementById(id);

          if (cell) {
            cell.style.background = color;
            if (!cell.names) cell.names = [];
            if (!cell.names.includes(name)) {
              cell.names.push(name);
            }

            const isStart = day.toLocaleDateString() === new Date(contract.start).toLocaleDateString();
            const isEnd = day.toLocaleDateString() === new Date(contract.end).toLocaleDateString();

            if (isStart && isEnd) {
              cell.innerText = "D/A";
            } else if (isStart) {
              cell.innerText = "A";
            } else if (isEnd) {
              cell.innerText = "D";
            }
          }

          day.setDate(day.getDate() + 1);
        }

        // Affichage associé au contrat
        const texte = `${contract.name} ${contract.RBNB ? '(RBNB)' : ''} : ${contract.description}`;
        creerZoneTexteEtendue(contract, texte);
        plotIncome(contract);
        updateTotal(contract);
      });
    } else {
      console.log("Aucun contrat trouvé pour cette année");
    }
  })
  .catch((error) => {
    console.error("Erreur lors de la récupération des contrats :", error);
  });


// --- 2. Charger les jours fériés ---
getDoc(holidaysRef)
  .then((docSnap) => {
    if (docSnap.exists()) {
      const listDayOff = docSnap.data().listDayOff || [];
      console.log("Jours fériés récupérés :", listDayOff);

      listDayOff.forEach((dayId) => {
        const cell = document.getElementById(dayId);
        if (cell) {
          cell.style.backgroundColor = "blue";
        }
      });
    } else {
      console.log("Aucun jour férié trouvé pour cette année");
    }
  })
  .catch((error) => {
    console.error("Erreur lors de la récupération des jours fériés :", error);
  });





  
};

const resetTotal = () => {
  document.getElementById("total-annee").setAttribute("Classic","0")
  document.getElementById("total-annee").setAttribute("RBNB","0")
  const totals = document.getElementsByClassName("total");
  Array.from(totals).forEach(total => {
    total.innerText = "0";
  });
  const totalsMonth = document.getElementsByClassName("month-total");
  Array.from(totalsMonth).forEach(total => {
    total.value = 0;
    total.innerText=`Normal : ${0}`

  });
  const RBNB = document.getElementsByClassName("month-total-RBNB");
  Array.from(RBNB).forEach(total => {
    total.value=0;
    total.innerText=`RBNB : ${0}`


  });
};

const updateTotal=(contract)=>{
  week=getWeekNumber(new Date(contract.start))
  month=new Date(contract.start).getMonth()
  year=new Date(contract.start).getFullYear()
  
  color=contract.RBNB? "yellow":"orange"
  let classic=Number(document.getElementById("total-annee").getAttribute("Classic"))
  let RBNB=Number(document.getElementById("total-annee").getAttribute("RBNB"))

  const totalWeek=document.getElementById(`total-${color}-${week}-${year}`)
  
  
  const totalWeekNb=Number(totalWeek.innerText)
  totalWeek.innerText=totalWeekNb+Number(contract.loyer)

  const monthId =contract.RBNB? `totalRBNB-${month}-${year}`:`totalClassic-${month}-${year}`

  const totalMonth=document.getElementById(monthId)
  
  const totalMonthNb=Number(totalMonth.value)
  totalMonth.value=totalMonthNb+Number(contract.loyer)
  totalMonth.innerText=contract.RBNB? `RBNB : ${totalMonth.value}`:`Normal : ${totalMonth.value}`

  if (contract.RBNB){RBNB+=Number(contract.loyer)}
  else {classic+=Number(contract.loyer)}
  document.getElementById("total-annee").innerText=`Montant Total : ${classic+RBNB} (Classique : ${classic} |RBNB : ${RBNB})`
  document.getElementById("total-annee").setAttribute("Classic",classic)
  document.getElementById("total-annee").setAttribute("RBNB",RBNB)
}


const deleteContract = ()=>{
      resetAllTd();


const docRef = doc(db, "Contrats", `contracts-${YEAR}`);

getDoc(docRef)
  .then((docSnap) => {
    if (docSnap.exists()) {
      const contrats = docSnap.data().listContract;
      console.log("Contrats récupérés :", contrats);

      const contratsRestants = contrats.filter(
        (contract) => contract.id !== selectingContract.id
      );

      // Mettre à jour le localStorage
      localStorage.setItem(`contracts-${YEAR}`, JSON.stringify(contratsRestants));

      // Réécrire dans Firestore
      setDoc(docRef, {
        listContract: contratsRestants,
      })
        .then(() => {
          console.log(`Liste des contrats ${YEAR} sauvegardée`);
        })
        .catch((error) => {
          console.error("Erreur de sauvegarde :", error);
        });

      document.getElementById("delete-contract-btn").classList.toggle("hidden");
      document.getElementById("modify-contract-btn").classList.toggle("hidden");

      result.innerText = `Contrat ${selectingContract.name} supprimé`;
      reset();
      resetTotal();
      newContract = false;
      updateDisplay();
    } else {
      console.log("Aucun contrat trouvé pour cette année");
    }
  })
  .catch((error) => {
    console.error("Erreur lors de la récupération :", error);
  });

      
}

const modifyContract=()=>{
      nameInput.value=selectingContract.name;
      appInput.value=selectingContract.app;
      startDateInput.value =selectingContract.start;
      endDateInput.value =selectingContract.end;
      loyerInput.value =selectingContract.loyer;
      nbAdultInput.value =selectingContract.NbAdulte;
      nbChildInput.value =selectingContract.NbEnfant;
      descriptionInput.value =selectingContract.description;
      RBNBInput.checked =selectingContract.RBNB;
      RBNBInputNo.checked =!selectingContract.RBNB;
      deleteContract();
      taskForm.classList.toggle("hidden")
      addButton.innerText="Modifier"
      

}


  function resetAllTd() {
    const thElements = document.querySelectorAll("td");
      thElements.forEach((td)=>{
        if (td.isPlanning){
        td.isStart = false;
        td.isEnd = false;
        td.style.background="white"
        td.innerText="";
        td.names=[]}
      })}

    function resetAllTh() {
    const thElements = document.querySelectorAll("th");
      thElements.forEach((th)=>{
        th.style.backgroundColor="white"
        
        th.names=[]
      })}


function creerZoneTexteEtendue(contract,texte) {
  

  // Calcul de la hauteur de e1
  
  const caractTextArea=getBestTextArea(contract)
  const length=caractTextArea[0]
  const start=caractTextArea[1]
  const startOffset=caractTextArea[2]
  const endOffset=caractTextArea[3]
  

  // Récupération de l'élément cible

e1 = document.getElementById(`${new Date(start).toLocaleDateString()}--app${contract.app}`);
// Positionner e1 en relatif pour pouvoir placer une zone absolue à l'intérieur
if (getComputedStyle(e1).position === 'static') {
  e1.style.position = 'relative';
}

// Création de la zone de texte
const zone = document.createElement('div');
zone.className = 'zone-texte-etendue';
zone.innerText = texte;

// Calcul de la position et de la largeur
const left = startOffset ? '100%' : '0%';
const largeurFactor = (
  (length || 0) -
  (startOffset ? 1 : 0) -
  (endOffset ?  1:0)
);

// Appliquer les styles
Object.assign(zone.style, {
  position: 'absolute',
  top: '0',
  left: left,
  height: `${e1.offsetHeight}px`,
  width: `${e1.offsetWidth * largeurFactor}px`,
  paddingLeft: '5px',
  display: 'flex',
  alignItems: 'center',
  fontWeight: 'bold',
  whiteSpace: 'normal',
  pointerEvents: 'none',
  userSelect: 'none',
  fontSize: '0.7rem',
  zIndex: '0',
  justifyContent: 'center',
  zIndex : "1000",
  

});



  // Ajouter dans e1
  e1.appendChild(zone);

}
  
const getBestTextArea=(contract)=>{
  let length
  let start
  let startOffset
  let endOffset
  let l1
  let l2
  let l3
  let l4 
  if (getWeekNumber(new Date(contract.start))===getWeekNumber(new Date(contract.end)))
  {
    if (new Date(contract.start).getMonth()===new Date(contract.end).getMonth()){
     length=new Date(contract.end).getDay()===0?7:new Date(contract.end).getDay()-new Date(contract.start).getDay()
     start=contract.start
     startOffset=true;
     endOffset=true;
     
    }else if (joursRestantsDansMois(new Date(contract.start))>new Date(contract.end).getDate()){
           length=joursRestantsDansMois(new Date(contract.start))+1
           start=contract.start
           startOffset=true;
           endOffset=false;
           
    }else {
         length=new Date(contract.end).getDate()
         const year=new Date(contract.end).getFullYear()
         const month=new Date(contract.end).getMonth()
         start=new Date(year, month,1)
         startOffset=false;
         endOffset=true;
        
    }
  }else if (getWeekNumber(new Date(contract.start))+1===getWeekNumber(new Date(contract.end))){
      if ( (new Date(contract.start).getMonth()===new Date(contract.end).getMonth())){
        //  même mois | cons week
        if (new Date(contract.end).getDay()===0?7:new Date(contract.end).getDay()>8-(new Date(contract.start).getDay()===0?7:new Date(contract.start).getDay()))
        {
           length=new Date(contract.end).getDay()===0?7:new Date(contract.end).getDay()
           const year=new Date(contract.end).getFullYear()
          const month=new Date(contract.end).getMonth()
           start=new Date(year, month,new Date(contract.end).getDate()-(new Date(contract.end).getDay()+6)%7)
           startOffset=false;
           endOffset=true;
           
        }else {
           length=(8-new Date(contract.start).getDay())%8
           start=new Date(contract.start)
           startOffset=true;
           endOffset=false;
          
        }
        }
      // mois cons |  semaine cons
      else{
        //semaine 1 coupé
        const month=new Date(contract.start).getMonth()
        const year=new Date(contract.start).getFullYear()
        const startday=new Date(contract.start).getDay()===0?7:new Date(contract.start).getDay()
        const startWeek=getWeekNumber(new Date(contract.start))
        const endday=new Date(contract.end).getDay()===0?7:new Date(contract.end).getDay()
        const endMonthDay=new Date(year,month+1,0).getDay()==0?7:new Date(year,month+1,0).getDay()
        const cutWeek=getWeekNumber(new Date(endMonthDay))
        
        if(startWeek==cutWeek){
          l1= endMonthDay-startday
          l2= 8-endMonthDay
           l3= endday
        }else{
         
          l1= 8-startday
          l2= endMonthDay
          l3= endday-endMonthDay
        }
        if (l1>l2+1 && l1>l3){
             length=l1
             start=new Date(contract.start)
             startOffset=true;
             endOffset=false;
             
        }else if (l2+1>l3){
             length=l2
             start=new Date(year,month+1,1-endMonthDay)
             startOffset=false;
             endOffset=false;
             
        }else {
             length=l3
             start=new Date(year,month+1,1)
             startOffset=false;
             endOffset=true;
             
        }

        }
       
        
      
  }else if (getWeekNumber(new Date(contract.start))+2===getWeekNumber(new Date(contract.end))){
        const month=new Date(contract.start).getMonth()
        const year=new Date(contract.start).getFullYear()
        const startday=new Date(contract.start).getDay()===0?7:new Date(contract.start).getDay()
        const startWeek=getWeekNumber(new Date(contract.start))
        const endday=new Date(contract.end).getDay()===0?7:new Date(contract.end).getDay()
        const endMonthDay=new Date(year,month+1,0).getDay()==0?7:new Date(year,month+1,0).getDay()
        const cutWeek=getWeekNumber(new Date(endMonthDay))
        if (startWeek!==cutWeek && startWeek+2!==cutWeek){
          l1= 8-startday
          l2= endMonthDay
          l3= 8-endMonthDay
          l4=endday
          
          if (l1>l2+1 && l1>l3+1 && l1>l4){
             length=l1
             start=new Date(contract.start)
             startOffset=true;
             endOffset=false;
             
          }else if ( l4>=l2+1 && l4>=l3+1){
             length=l4
            const day=new Date(contract.end).getDate()
             start=new Date(year,month+1,day-endday+1)
             startOffset=false;
             endOffset=true;
             
          }
          else if (l2>l3){
             length=l2
            const day=new Date(contract.end).getDate()
             start=new Date(year,month+1,day-endday+1)
             startOffset=false;
             endOffset=false;
             
          }else{
            length=l3-1
            const day=new Date(contract.end).getDate()
            start=new Date(year,month+1,1)
            startOffset=false;
            endOffset=false;
            
          }
        }else{
            const month=new Date(contract.start).getMonth()
            const year=new Date(contract.start).getFullYear()
            const date=new Date(contract.start).getDate()
            const day=new Date(contract.start).getDay()===0? 7:new Date(contract.start).getDay()
             length=7
             start=new Date(year,month,date+8-day)
             startOffset=false;
             endOffset=false;
             
        }
  }
  else{ 
            const month=new Date(contract.start).getMonth()
            const year=new Date(contract.start).getFullYear()
            const date=new Date(contract.start).getDate()
            const day=new Date(contract.start).getDay()===0? 7:new Date(contract.start).getDay()
             length=7
             start=new Date(year,month,date+7-day+1)
             startOffset=false;
             endOffset=false;
             

  }
  return [length,start,startOffset,endOffset]
}



function joursRestantsDansMois(date) {
    // Obtenir l'année et le mois de la date
    const annee = date.getFullYear();
    const mois = date.getMonth(); // 0 = janvier, 11 = décembre

    // Trouver le dernier jour du mois
    const dernierJourDuMois = new Date(annee, mois + 1, 0).getDate();

    // Jour actuel
    const jourActuel = date.getDate();

    // Calcul du nombre de jours restants
    return dernierJourDuMois - jourActuel;
}


const calcTax=(contract)=>{
  const nbNuit=new Date(contract.end).getDate()-new Date(contract.start).getDate()
  const nbApp=contract.app
  const nbAdult=contract.NbAdulte
  console.log(nbNuit,nbAdult,nbApp)
  if (nbApp==1){
    return "a définir" //icisa
  }else {
    return 0.75*nbAdult*nbNuit
  }
  
}


const debutPlanning = 2022;
const finPlanning = new Date().getFullYear() + 1; // année actuelle + 1
const ulPlanning = document.getElementById('year-list');

for (let annee = debutPlanning; annee <= finPlanning; annee++) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = "#";
  a.textContent = annee;
  a.addEventListener('click', (e) => {
    e.preventDefault(); // éviter le saut de page
    generatePlanning(annee);
  });
  li.appendChild(a);
  ulPlanning.appendChild(li);
}