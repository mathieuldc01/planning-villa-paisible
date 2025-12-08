import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.2'
const supabaseUrl = 'https://ikbmdtbyhxdlzoqkfmew.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrYm1kdGJ5aHhkbHpvcWtmbWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NzE4MDksImV4cCI6MjA3MjU0NzgwOX0.DHcPtjFe7C2bCrFS9ruplwW1aZfEkSOrYjnUIHMdSA4"
const _supabase = createClient(supabaseUrl, supabaseKey)







function isDateBeforeOrEqual(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // Extraire uniquement jour, mois, année
  const y1 = d1.getFullYear(), m1 = d1.getMonth(), day1 = d1.getDate();
  const y2 = d2.getFullYear(), m2 = d2.getMonth(), day2 = d2.getDate();

  // Comparaison manuelle
  if (y1 < y2) return true;
  if (y1 > y2) return false;
  if (m1 < m2) return true;
  if (m1 > m2) return false;
  return day1 <= day2;
}

function nombreDeJoursEntre(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // Réinitialiser l'heure à minuit pour éviter les décalages
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);

  const diffMs = d2 - d1; // différence en millisecondes
  const diffJours = diffMs / (1000 * 60 * 60 * 24); // conversion en jours

  return diffJours;
}



async function insertData(table, data) {
  const payload = { ...data };
  const { error } = await _supabase
    .from(table)
    .upsert(payload, { onConflict: 'id' }); 
  if (error) {
    console.error(`Erreur lors de l'insertion dans ${table} :`, error);
    return false;
  }
  if (table==='contrats' && new Date(payload.start).getFullYear()!==new Date(payload.end).getFullYear()){
    data.year=new Date(data.end).getFullYear()
    data.id= `${data.name}-${new Date()}-bis`
    const payload = { ...data };
    const { error } = await _supabase
    .from(table)
    .upsert(payload, { onConflict: 'id' }); // upsert pour insérer ou mettre à jour si id existe
    if (error) {
    console.error(`Erreur lors de l'insertion dans ${table} :`, error);
    return false;
  }
  }
  
  return true;
}


const  validContract= async (end)=>{
    let isValid=true
    const listContract= await loadData("contrats",YEAR);
    
      const app = selectingContract.app;
      const name = selectingContract.id;
      let day = new Date(selectingContract.start);
      day.setDate(day.getDate() + 1);

      while (day < end) {
        const dayStr = day.toLocaleDateString('fr-FR');
        const id = `${dayStr}--app${app}`;
        const cell = document.getElementById(id);
        if (cell) {
          listContract.forEach((contrat)=>{
              
            if (dayStr===new Date(contrat.start).toLocaleDateString('fr-FR')&& app===contrat.app){
              
              isValid=false
            }
          })
        }
            day.setDate(day.getDate() + 1);

        
      }
      return isValid
}

// loadData(table: string, year: number)
async function loadData(table, year) {
  const { data, error } = await _supabase
    .from(table)
    .select()
    .eq('year', year);  // filtre sur la colonne 'year' = valeur year passée en paramètre

  if (error) {
    console.error(`Erreur lors du chargement des données depuis ${table} :`, error);
    return [];
  }
  return data;  // retourne un tableau
}


// deleteData(table: string, id: string)
async function deleteData(table, id) {
  const { error } = await _supabase
    .from(table)
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error(`Erreur lors de la suppression dans ${table} :`, error);
    return false;
  }
  return true;
}




/* Fonction principale pour tester
async function main() {
  const table = 'contrats';
  const testId = 'contrat-test-2025';

  const testData = {
    id:"test2",
    activate: true,
    name: 'Test User',
    start: '2025-05-01',
    end: '2025-09-01',
    app: 1,
    loyer: 1200,
    taxeDeSejour: 30,
    NbAdulte: 2,
    NbEnfant: 1,
    description: 'Contrat test pour 2025',
    RBNB: false,
  };

  console.log('Insertion du contrat...');
  const insertOk = await insertData(table, testData);
  console.log('Insertion réussie ?', insertOk);

  console.log('Chargement des contrats pour 2025...');
  const contrats2025 = await loadData(table, 2025);
  console.log('Contrats récupérés :', contrats2025);



  console.log('Fin des tests');
}

main();
*/


async function generateExcel() {

let tax=0
let taxRBNB=0
let loyer=0
let loyerRBNB=0
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Feuille1');

// Ajouter l'entête
const headers = ['APP','NOMS', 'DATE', 'LOYER', "NOMBRE D'ADULTE", "NOMBRE D'ENFANT", 'TAXE DE SEJOUR', 'LOYER RBNB', 'REMARQUES'];
const headerRow=worksheet.addRow(headers);
style(headerRow)
worksheet.addRow([])
// Récupérer les contrats
const ListContract = await loadData("contrats",YEAR)
ListContract.sort((a,b)=>{if (a.app!==b.app){
  return a.app-b.app
}else{
  nombreDeJoursEntre(a.start,b.start)
}})
let app=1
let totapp=0
let totapprbnb=0
let totapptax=0
// Ajouter les données
ListContract.forEach(contract => {
  if (app!=contract.app){
    const total = [`TOTAL APPARTEMENT ${app}`,'', '', totapp,"", "", totapptax, totapprbnb, ''];
    const headerRow=worksheet.addRow(total);
    style(headerRow)
    app=contract.app
    totapp=0
    totapprbnb=0
    totapptax=0
    worksheet.addRow([])
  }
  const taxe = parseFloat(calcTax(contract).toFixed(2));
  console.log(contract.name,taxe)
  const headerRow=worksheet.addRow([
    contract.app,
    contract.name,
    `Du ${new Date(contract.start).toLocaleDateString("FR-fr")} au ${new Date(contract.end).toLocaleDateString("FR-fr")}`,
    contract.RBNB ? "" : contract.loyer,
    contract.NbAdulte,
    contract.NbEnfant,
    contract.RBNB ? "" : taxe,
    contract.RBNB ? contract.loyer : "",
    contract.RBNB ? taxe : "",
    contract.description
  ]);

  style(headerRow)
  loyer+=contract.RBNB? 0:Number(contract.loyer)
  loyerRBNB+=contract.RBNB? Number(contract.loyer):0
  tax+=contract.RBNB? 0:taxe
  totapp+=contract.RBNB? 0:Number(contract.loyer)
  totapprbnb+=contract.RBNB? Number(contract.loyer):0
  totapptax+=contract.RBNB? 0:taxe
});

// Ajuster la largeur des colonnes automatiquement
headers.forEach((_, colIndex) => {
  let maxLength = 0;
  worksheet.eachRow(row => {
    const cell = row.getCell(colIndex + 1);
    const cellValue = cell.value ? cell.value.toString() : '';
    if (cellValue.length > maxLength) maxLength = cellValue.length;
  });
  worksheet.getColumn(colIndex + 1).width = maxLength + 10; // +2 pour un peu d'espace
});

const subtotal = [`TOTAL APPARtEMENt ${app}`,'', '', totapp,"", "", totapptax, totapprbnb, ''];
    const subheaderRow=worksheet.addRow(subtotal);
    style(subheaderRow)

const total = ['TOTAL','', '', loyer,"", "", tax, loyerRBNB, ''];
const headerRowTotal=worksheet.addRow(total);
worksheet.addRow([]);
style(headerRowTotal)

  // Exporter le fichier
  const buf = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buf]), `Résumé-année-${YEAR}-au-${new Date().toLocaleDateString()}.xlsx`);
}






const selectingContract = {
  id:null,
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
  RBNB : null,
  year : 0,
};

let app
let manageContract=false;
let newContract = false;
const nbAppartements = 7;
let newVac=false;


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
let YEAR = new Date().getFullYear();
let selectedHld=false;
let selectedHldVac=false;
let startVac;

function generatePlanning(year) {
  YEAR = year;
  selectingContract.year=YEAR
  const planningContainer = document.getElementById("planning");
  
  planningContainer.innerHTML = `
    <h2>Planning ${year}</h2>
    <div class="add-contract-div">
      <button type="button" class="add-contract-button" id="btn">Ajouter contrat</button>
      <button type="button" class="add-contract-button" id="btn-hld">Ajouter Jour fériés</button>
      <button type="button" class="add-contract-button" id="btn-hld-vac">Ajouter Vacances</button>

      <button type="button" class="add-contract-button" id="btn-excel">Télécharger Excel</button>
      <p id="result" class="add-contract-info"></p>
      <button id="delete-contract-btn" class="add-contract-button hidden">Supprimer</button>
      <button id="modify-contract-btn" class="add-contract-button hidden">Modifier</button>
    </div>
    <div id="total-annee"></div>`;

  const button = document.getElementById("btn");
  const buttonHld = document.getElementById("btn-hld");
  const buttonHldVac = document.getElementById("btn-hld-vac");
  const result = document.getElementById("result");
  const deleteContractBtn = document.getElementById("delete-contract-btn");
  const modifyContractBtn = document.getElementById("modify-contract-btn");

  const Excel=document.getElementById("btn-excel")
  Excel.addEventListener("click",generateExcel)
  document.getElementById("total-annee").setAttribute("Classic","0");
  document.getElementById("total-annee").setAttribute("RBNB","0");
  deleteContractBtn.addEventListener("click",async () => {
    await deleteContract();
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

    buttonHld.innerText="Ajouter Jour fériés"
    selectedHld=false
    buttonHldVac.innerText="Ajouter Vacances"
    selectedHldVac=false


    selectingContract.activate = true;
    app = selectingContract.app;
    result.innerText = "Cliquez d'abord sur la date de début, puis sur la date de fin dans le planning.";
  });

  buttonHld.addEventListener("click", () => {
    if (selectedHld) {
      buttonHld.innerText = "Mettre à jour Jour férié";
      result.innerText = "";
      selectedHld = false;
    } else {
      result.innerText = "Cliquez sur les jours fériés.";
      selectedHld = true;
      buttonHld.innerText = "Terminer";

      selectedHldVac = false;
      buttonHldVac.innerText = "Mettre à jour Vacances";
      button.innerText = "Ajouter Contrat";
      if (newContract){
        result.innerText = "Nouveau contrat annulé";
        newContract = false;
      }
      
    }
  });

  buttonHldVac.addEventListener("click", () => {
    if (selectedHldVac) {
      buttonHldVac.innerText = "Mettre à jour Vacances";
      result.innerText = "";
      selectedHldVac = false;
    } else {
      result.innerText = "Cliquez sur le début des vacances.";
      selectedHldVac = true;
      buttonHldVac.innerText = "Terminer";

      selectedHld = false;
      buttonHld.innerText = "Mettre à jour Jours Férié";
      if (newContract){
        result.innerText = "Nouveau contrat annulé";
        newContract = false;
      }
      button.innerText = "Ajouter Contrat";
      
    }
  });

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const VacPrice=['1 : 350€ | 2&3 : 500€ | 4 : 470€ | 5 : 800€',
    '1 : 350€ | 2&3 : 500€ | 4 : 470€ | 5 : 800€',
    '1 : 350€ | 2&3 : 500€ | 4 : 470€ | 5 : 800€',
  '',
'',
'',
'1 : 350€ | 2&3 : 500€ | 4 : 450€ | 5 : 700€',
'1 : 350€ | 2&3 : 500€ | 4 : 450€ | 5 : 700€',
'',
'',
'',
'1 : 350€ | 2&3 : 500€ | 4 : 450€ | 5 : 700€']

  const CurePrice=['',
    '',
    '',
    '1 : 550€ | 2&3 : 620€ | 4 : 600€ | 5 : 700€',
    '1 : 550€ | 2&3 : 650€ | 4 : 600€ | 5 : 800€',
    '1 : 550€ | 2&3 : 650€ | 4 : 600€ | 5 : 800€',
    '1 : 550€ | 2&3 : 650€ | 4 : 600€ | 5 : 800€',
    '1 : 550€ | 2&3 : 650€ | 4 : 600€ | 5 : 800€',
    '1 : 550€ | 2&3 : 650€ | 4 : 600€ | 5 : 800€',
    '1 : 500€ | 2&3 : 620€ | 4 : 580€ | 5 : 700€',
    '1 : 500€ | 2&3 : 620€ | 4 : 580€ | 5 : 700€',
    '',
  ]

  const dayNames = ["D", "L", "M", "M", "J", "V", "S"];
  

  for (let m = 0; m < 13; m++) {
    const month=m%12;
    const daysInMonth = new Date(year+Math.floor(m/12), month + 1, 0).getDate();
    const monthDiv = document.createElement("div");
    monthDiv.classList.add("month");

    const titleContainerInfo = document.createElement("div");
    titleContainerInfo.style.display = "flex";
    titleContainerInfo.style.alignItems = "center";
    
    if (VacPrice[month]!==""){
    const titleInfoVac = document.createElement("h2");
    titleInfoVac.classList.add("month-table");
    titleInfoVac.textContent = 'Vacances : '+VacPrice[month];
    titleInfoVac.style.color='blue'
    titleContainerInfo.appendChild(titleInfoVac);
    }

    if (CurePrice[month]!=="" && VacPrice[month]!==""){
    const titleInfoSpace = document.createElement("h2");
    titleInfoSpace.classList.add("month-table");
    titleInfoSpace.textContent = ` / `
    titleContainerInfo.appendChild(titleInfoSpace);
    }

    if (CurePrice[month]!==""){
    const titleInfoCure = document.createElement("h2");
    titleInfoCure.classList.add("month-table");
    titleInfoCure.textContent ='Cure : '+CurePrice[month];
    titleInfoCure.style.color='red'
    titleContainerInfo.appendChild(titleInfoCure);
    
    }
    monthDiv.appendChild(titleContainerInfo);
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
      
      if (week > 6 && month === 0) week = -week;
      if (week < 6 && month === 11) week = 100+week;
      if (!weeks[week]) weeks[week] = [];
      weeks[week].push({ date, day });
    }
    
    const table = document.createElement("table");
    table.classList.add("month-table");
    const thead = document.createElement("thead");

    // Ligne des numéros de semaine
    const weekRow = document.createElement("tr");
    weekRow.appendChild(document.createElement("th"));
    Object.keys(weeks)
    .map(Number) // transforme les clés en nombres
    .sort((a, b) => a - b) // tri numérique croissant
    .forEach(week => {
      const isFull = weeks[week][weeks[week].length - 1].date.getDay() === 0;
      const th = document.createElement("th");
      th.colSpan = weeks[week].length;
      if (isFull) th.colSpan += 2;
      th.textContent = `Semaine ${Math.abs(week) > 100 ? week - 100 : Math.abs(week)}`;
      weekRow.appendChild(th);
    });
    const totalMonthHead=createColorColumn("white")
    totalMonthHead.innerText="Total du Mois"
    weekRow.append(totalMonthHead)
    thead.appendChild(weekRow);

    // Ligne des noms de jours
    const daysRow = document.createElement("tr");
    daysRow.appendChild(document.createElement("th"));
    Object.keys(weeks)
    .map(Number) // transforme les clés en nombres
    .sort((a, b) => a - b) // tri numérique croissant
    .forEach(week => {
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
    Object.keys(weeks)
    .map(Number) // transforme les clés en nombres
    .sort((a, b) => a - b) // tri numérique croissant
    .forEach(week => {
      const isFull=weeks[week][weeks[week].length-1].date.getDay()===0;
      weeks[week].forEach(dayObj => {
          const th = document.createElement("th");
          th.textContent = dayObj.day;
          th.isDayOff = false;
          th.id = `${dayObj.date.toLocaleDateString("en-US")}`;
          th.addEventListener("click",async () => {
                if (selectedHld) {
                    const listDayOff=await loadData("jours_feries", YEAR)
                    if (listDayOff.some(obj => obj.id === th.id)) {
                      th.style.backgroundColor="white"
                      await deleteData("jours_feries", th.id)
                    } else {
                      th.style.backgroundColor="blue"
                      await insertData('jours_feries', {id:th.id,year:YEAR});
                    }
                   
                    }
                  if (selectedHldVac) {
                    if (th.style.backgroundColor==="green"){
                        th.style.backgroundColor="white"
                        await deleteData("holliday", th.id)

                    }
                    else
                      {if (!newVac){
                      newVac=true
                      startVac=th.id
                      if (th.style.backgroundColorth!=='blue'){
                          th.style.backgroundColor="green"}
                      result.innerText="Sélectionner la fin des Vacances"
                      await insertData('holliday', {id:startVac,year:YEAR});

                    }else{
                      newVac=false
                      const endVac=th.id 
                      result.innerText="Sélectionner le début des Vacances"   
                                        
                      while (startVac!==endVac){
                        
                        const startDate = new Date(startVac);

                        // Incrémenter d’un jour
                        startDate.setDate(startDate.getDate() + 1);

                        // Formater la nouvelle date
                        startVac = startDate.toLocaleDateString("en-US");

                        

                        
                        if (document.getElementById(startVac).style.backgroundColor!=='blue'){
                          
                          document.getElementById(startVac).style.backgroundColor="green"}
                        
                        await insertData('holliday', {id:startVac,year:YEAR});

                      
                      
                    
                      }
                    }
                  }
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
      
      Object.keys(weeks)
      .map(Number) // transforme les clés en nombres
      .sort((a, b) => a - b) // tri numérique croissant
      .forEach(week => {
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

          td.addEventListener("click",async () => {

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
                    const test= await validContract(clickedDate)
                if (clickedDate >= selectingContract.start && ap === selectingContract.app && test) {
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
                  if (!test){result.innerText="Période contrat non disponible"}else{
                  alert(`Date de fin invalide (même appart (${selectingContract.app}) et après le début)`);}
                }
              }
            } else if (td.names.length > 0) {
              
              const saveContract=await loadData("contrats", YEAR)

                    updateSelectingContract(saveContract.find(contract => contract.id === td.names[0] || contract.id === td.names[0]+'-bis' ));
                    deleteContractBtn.classList.remove("hidden");
                    modifyContractBtn.classList.remove("hidden");

                    result.innerText = `Locataires : ${selectingContract.name} \n`;
                    result.innerText += `Nombre d'adulte :${selectingContract.NbAdulte} ${Number(selectingContract.NbEnfant) > 0 ? `| Nombre d'enfant ${selectingContract.NbEnfant}` : ''} \n`;
                    result.innerText += `Loyer : ${selectingContract.loyer} | Taxe de séjour ${selectingContract.taxeDeSejour}\n`;
                    result.innerText += `Date : du ${selectingContract.start} au ${selectingContract.end}\n`;
                    result.innerText += `Remarque : ${selectingContract.description}`;
                


            }
        
          });
          tr.appendChild(td);
        });
        
        if (isFull){
        const totalWeekApp=createColorColumn("yellow",Math.abs(week) > 100 ? week - 100 : Math.abs(week),ap,year+Math.floor(m/12))
        totalWeekApp.classList.add("total")
        tr.appendChild(totalWeekApp)
        
        const totalWeekAppRBNB=createColorColumn("orange",Math.abs(week) > 100 ? week - 100 : Math.abs(week),ap,year+Math.floor(m/12))
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
      
      Object.keys(weeks)
      .map(Number) // transforme les clés en nombres
      .sort((a, b) => a - b) // tri numérique croissant
      .forEach(week => {
        
        const isFull=weeks[week][weeks[week].length-1].date.getDay()===0;
        weeks[week].forEach(dayObj => {
          const td = document.createElement("td");
          td.style.border="none"
          tr.appendChild(td);
        });
        
        if(isFull){
        
        const totalYellow=createColorColumn("yellow")
        totalYellow.innerText=0
        totalYellow.id=`total-yellow-${Math.abs(week) > 100 ? week - 100 : Math.abs(week)}-${year+Math.floor(m/12)}`
        totalYellow.classList.add("total")
        const totalOrange=createColorColumn("orange")
        totalOrange.innerText=0
        totalOrange.id=`total-orange-${Math.abs(week) > 100 ? week - 100 : Math.abs(week)}-${year+Math.floor(m/12)}`
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


const addContract= async ()=>{


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
  result.innerText=`${addButton.innerText==="Modifier"? "Contrat modifier : " : "Ajout d'un contrat : "} ${selectingContract.name}`

  

  await insertData('contrats', selectingContract);
  
  closeForm();



}


const updateSelectingContract = (contract)=>{
  selectingContract.activate=false;
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



const closeForm=()=>{

  taskForm.classList.add("hidden");
  resetForm();
  updateDisplay();
  reset();

}


const plotIncome=(contract)=>{
    const color=contract.RBNB? "yellow" : "orange"
    const year = new Date(contract.start).getFullYear()
  const cell=document.getElementById(`week-${getWeekNumber(new Date(contract.start))}app-${contract.app}-color${color}-${year}`)
  if (cell){
  cell.innerText=contract.loyer;}
}

const updateDisplay = async () => {
    const week=getWeekNumber(new Date())
    const day=new Date().getDate()
    const year=new Date().getFullYear()
    
    if(document.getElementById(`${day}-${week}-${year}`)){
      
        document.getElementById(`${day}-${week}-${year}`).style.border="3px solid red"
  
    };
      const listContract = await loadData("contrats", YEAR)
      const listDayOff = await loadData("jours_feries", YEAR)
      const listVac = await loadData("holliday", YEAR)
      resetAllTh();
      resetTotal();
      resetAllTd();

    listContract.forEach((contract) => {
      const color = contract.RBNB ? "yellow" : "yellow";
      const app = contract.app;
      const name = contract.id;

      let day = new Date(contract.start);
      const end = new Date(contract.end);
      
      while (isDateBeforeOrEqual(day,end)) {
        const dayStr = day.toLocaleDateString('fr-FR');
        const id = `${dayStr}--app${app}`;
        const cell = document.getElementById(id);

        if (cell) {
          cell.style.background = color;
          if (!cell.names) cell.names = [];
          if (!cell.names.includes(name)) {
            cell.names.push(name);
          }

          cell.isStart =cell.isStart || day.toLocaleDateString() === new Date(contract.start).toLocaleDateString();
          cell.isEnd =cell.isEnd  || day.toLocaleDateString() === new Date(contract.end).toLocaleDateString();
          

          if (cell.isStart && cell.isEnd) {
            cell.innerText = "D/A";
          } else if (cell.isStart) {
            cell.innerText = "A";
          } else if (cell.isEnd) {
            cell.innerText = "D";
          }
        }

        day.setDate(day.getDate() + 1);
      }
      
    })

  listContract.forEach((contract)=>{
      // Affichage associé au contrat
      const texte = contract.description? `${contract.name} : ${contract.description}` : `${contract.name}`;
      creerZoneTexteEtendue(contract, texte);
      plotIncome(contract);
      updateTotal(contract,1);
  })


  listDayOff.forEach((dayId) => {
    const cell = document.getElementById(dayId.id);
    if (cell) {
      cell.style.backgroundColor = "blue";
    }
  });
  listVac.forEach((dayId) => {
    const cell = document.getElementById(dayId.id);
    if (cell) {
      cell.style.backgroundColor = "green";
    }
  });
    
reset()



  
};

const resetTotal = () => {
  document.getElementById("total-annee").setAttribute("Classic","0");
  document.getElementById("total-annee").setAttribute("RBNB","0");
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

const updateTotal=(contract,action)=>{
  
  // Crée le 1er janvier de la même année
const startDate = new Date(contract.start)
const janFirst = new Date(YEAR, 0, 1);



// Prend la date maximale entre start et le 1er janvier
  if (startDate >= janFirst){
  const week=getWeekNumber(startDate)
  const month=new Date(startDate).getMonth()
  const year=new Date(startDate).getFullYear()
  
  const color=contract.RBNB? "yellow":"orange"
  let classic=Number(document.getElementById("total-annee").getAttribute("Classic"))
  let RBNB=Number(document.getElementById("total-annee").getAttribute("RBNB"))
  const totalWeek=document.getElementById(`total-${color}-${week}-${year}`)

  const totalWeekNb=parseFloat(Number(totalWeek.innerText).toFixed(2))

  totalWeek.innerText=parseFloat((totalWeekNb+Number(contract.loyer)).toFixed(2))

  const monthId =contract.RBNB? `totalRBNB-${month}-${year}`:`totalClassic-${month}-${year}`

  const totalMonth=document.getElementById(monthId)
  
  const totalMonthNb=Number(totalMonth.value)
  totalMonth.value=parseFloat((totalMonthNb+action*Number(contract.loyer)).toFixed(2))

  totalMonth.innerText=contract.RBNB? `RBNB : ${totalMonth.value}`:`Normal : ${totalMonth.value}`
  

  if (contract.RBNB){RBNB=parseFloat((RBNB+action*Number(contract.loyer)).toFixed(2))}
  else {classic= parseFloat((classic+action*Number(contract.loyer)).toFixed(2))}
  document.getElementById("total-annee").innerText=`Montant Total : ${classic+RBNB} (Classique : ${classic} |RBNB : ${RBNB})`
  document.getElementById("total-annee").setAttribute("Classic",classic)
  document.getElementById("total-annee").setAttribute("RBNB",RBNB)
}
}

const deleteContract = async ()=>{

      const id = selectingContract.id;

      // Vérifie si l'id se termine par "bis"
      const endsWithBis = id.endsWith("-bis");

      // Supprime le suffixe "bis" si présent
      const idSansBis = endsWithBis ? id.slice(0, -4) : id;

      // Ajoute "bis" si absent
      const idAvecBis = endsWithBis ? id : id + "-bis";

      updateTotal(selectingContract,-1)
      await deleteData("contrats", idSansBis)
      await deleteData("contrats", idAvecBis)
      
      document.getElementById("delete-contract-btn").classList.toggle("hidden");
      document.getElementById("modify-contract-btn").classList.toggle("hidden");

      
      newContract = false;
      result.innerText = `Contrat ${selectingContract.name} supprimé`;
      

}











const modifyContract=async()=>{
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
      await deleteContract();
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
const startDate = new Date(start);

// Crée le 1er janvier de la même année
const janFirst = new Date(YEAR, 0, 1);

// Prend la date maximale entre start et le 1er janvier
const effectiveDate = startDate < janFirst ? janFirst : startDate;







const e1 = document.getElementById(`${effectiveDate.toLocaleDateString()}--app${contract.app}`);
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
  fontSize: '1rem',
  
  justifyContent: 'center',
  zIndex : "2",
  

});



  // Ajouter dans e1
  e1.appendChild(zone);

}
  
const getBestTextArea=(contract)=>{
const janFirst = new Date(YEAR, 0, 1); 
const decThirtyFirst = new Date(YEAR+1, 0, 31); 


  const contractStart = isDateBeforeOrEqual(new Date(contract.start),janFirst)? formatDateToInput(janFirst):contract.start
  const contractEnd = isDateBeforeOrEqual(new Date(contract.end),decThirtyFirst)? contract.end:formatDateToInput(decThirtyFirst)
  let delta=getWeekNumber(new Date(contractEnd))-getWeekNumber(new Date(contractStart))
  console.log(delta,contract.name)
  if (delta<0 || delta>40){
    delta=Math.ceil(nombreDeJoursEntre(new Date(contractStart), new Date(contractEnd))/7)+1-(new Date(contractEnd).getDay()>new Date(contractStart).getDay()?0:1)
  }
  console.log(delta,contract.name)
  let length
  let start
  let startOffset
  let endOffset
  let l1
  let l2
  let l3
  let l4 
  if (delta===0)
  {
    if (new Date(contractStart).getMonth()===new Date(contractEnd).getMonth()){
     length=(new Date(contractEnd).getDay()===0?7:new Date(contractEnd).getDay())-new Date(contractStart).getDay()+1
     start=contractStart
     startOffset=true;
     endOffset=true;
     
    }else if (joursRestantsDansMois(new Date(contractStart))>new Date(contractEnd).getDate()){
           length=joursRestantsDansMois(new Date(contractStart))+1
           start=contractStart
           startOffset=true;
           endOffset=false;
           
    }else {
         length=new Date(contractEnd).getDate()
         const year=new Date(contractEnd).getFullYear()
         const month=new Date(contractEnd).getMonth()
         start=new Date(year, month,1)
         startOffset=false;
         endOffset=true;
        
    }
  }else if (delta===1){
      
      if ( (new Date(contractStart).getMonth()===new Date(contractEnd).getMonth())){
        //  même mois | cons week
        if ((new Date(contractEnd).getDay()===0?7:new Date(contractEnd).getDay())>8-(new Date(contractStart).getDay()===0?7:new Date(contractStart).getDay()))
        {
           length=new Date(contractEnd).getDay()===0?7:new Date(contractEnd).getDay()
           const year=new Date(contractEnd).getFullYear()
          const month=new Date(contractEnd).getMonth()
           start=new Date(year, month,new Date(contractEnd).getDate()-(new Date(contractEnd).getDay()+6)%7)
           startOffset=false;
           endOffset=true;
           
        }else {
           length=(8-new Date(contractStart).getDay())%8
           start=new Date(contractStart)
           startOffset=true;
           endOffset=false;
          
        }
        }
      // mois cons |  semaine cons
      else{
        //semaine 1 coupé
        const month=new Date(contractStart).getMonth()
        const year=new Date(contractStart).getFullYear()
        const startday=new Date(contractStart).getDay()===0?7:new Date(contractStart).getDay()
        const startWeek=getWeekNumber(new Date(contractStart))
        const endday=new Date(contractEnd).getDay()===0?7:new Date(contractEnd).getDay()
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
             start=new Date(contractStart)
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
       
        
      
  }else if (delta===2){
        const month=new Date(contractStart).getMonth()
        const year=new Date(contractStart).getFullYear()
        const startday=new Date(contractStart).getDay()===0?7:new Date(contractStart).getDay()
        const startWeek=getWeekNumber(new Date(contractStart))
        const endday=new Date(contractEnd).getDay()===0?7:new Date(contractEnd).getDay()
        const endMonthDay=new Date(year,month+1,0).getDay()==0?7:new Date(year,month+1,0).getDay()
        const cutWeek=getWeekNumber(new Date(year,month+1,0))

        if (startWeek!==cutWeek && startWeek+2!==cutWeek && endday>endMonthDay && startWeek && cutWeek!==1){
          console.log(contract.name)
          l1= 8-startday
          l2= endMonthDay
          l3= 8-endMonthDay
          l4=endday
          
          if (l1>l2+1 && l1>l3+1 && l1>l4){
             length=l1
             start=new Date(contractStart)
             startOffset=true;
             endOffset=false;
             
          }else if ( l4>=l2+1 && l4>=l3+1){
             length=l4
            const day=new Date(contractEnd).getDate()
             start=new Date(year,month+1,day-endday+1)
             startOffset=false;
             endOffset=true;
             
          }
          else if (l2>l3){
             length=l2
            const day=new Date(contractEnd).getDate()
             start=new Date(year,month+1,day-endday+1)
             startOffset=false;
             endOffset=false;
             
          }else{
            length=l3-1
            const day=new Date(contractEnd).getDate()
            start=new Date(year,month+1,1)
            startOffset=false;
            endOffset=false;
            
          }
        }else{
            const month=new Date(contractStart).getMonth()
            const year=new Date(contractStart).getFullYear()
            const date=new Date(contractStart).getDate()
            const day=new Date(contractStart).getDay()===0? 7:new Date(contractStart).getDay()
             length=7
             start=new Date(year,month,date+8-day)
             startOffset=false;
             endOffset=false;
             
        }
  }
  else{ 
    
            const month=new Date(contractStart).getMonth()
            const year=new Date(contractStart).getFullYear()
            const date=new Date(contractStart).getDate()
            const day=new Date(contractStart).getDay()===0? 7:new Date(contractStart).getDay()
            const endMonthDay=new Date(year,month+1,0).getDay()==0?7:new Date(year,month+1,0).getDay()
            const cutWeek=getWeekNumber(new Date(year,month+1,0))
            const startWeek=getWeekNumber(new Date(contractStart))
             length=7
             if (cutWeek-1==startWeek || cutWeek===1){
              start=new Date(year,month,date+14-day+1)
             }
             else{
             start=new Date(year,month,date+7-day+1)
             }
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
  const nbNuit=Math.round(nombreDeJoursEntre(contract.start,contract.end))
  const nbApp=contract.app
  const nbAdult=Number(contract.NbAdulte)
  console.log(contract.name,nbNuit)
  if (!contract.RBNB){
  if (nbApp==1){
    return parseFloat((Math.min(
    1.35,
    contract.loyer / (nbAdult + Number(contract.NbEnfant)) / nbNuit * 0.05
    )*nbAdult * nbNuit).toFixed(2))
  }else {
    return 0.85*nbAdult*nbNuit
  }
}
  return 0
}


const debutPlanning = 2022;
const finPlanning = new Date().getFullYear() + 1; // année actuelle + 1
const ulPlanning = document.getElementById('year-list');

generatePlanning(YEAR)
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


const style=(row)=>{
  row.eachCell((cell) => {
  //cell.font = { bold: true }; // Texte en gras

  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DCE6F1' }, // Couleur de fond bleu clair
  };

  cell.border = {
    top:    { style: 'thin', color: { argb: '000000' } },
    left:   { style: 'thin', color: { argb: '000000' } },
    bottom: { style: 'thin', color: { argb: '000000' } },
    right:  { style: 'thin', color: { argb: '000000' } }
  };

  cell.alignment = {
    vertical: 'middle',
    horizontal: 'center',
  };
});
}