const axios = require('axios').default;
const fs = require("fs-extra");
const {performance} = require('perf_hooks');
const calcmodule = require('./calculations')

var columns = [
  {id: 901, name :'id'},
  {id: 902, name :'datestarted'},
  {id: 903, name :'datesubmitted'},
  {id: 904, name :'status'},

//demographics
  {id: 277, name :'sessionid'},
  {id: 232, name :'email'},
  {id: 324, name :'countryofresidence'},
  {id: 325, name :'stateofresidence'}, //or
  {id: 326, name :'provinceofresidence'}, //or
  {id: 287, name :'jobrole'},
  {id: 288, name :'claimnumber'}, //or
  {id: 289, name :'policynumber'}, //or
  {id: 290, name :'accountnumber'}, //or
  {id:   4, name :'dateofvisit'},
  {id: 183, name :'policyholder'},
  {id: 285, name :'countryofvisit'},
  {id: 185, name :'street'},
  {id: 208, name :'city'},
  {id: 209, name :'stateofvisit'}, //or
  {id: 286, name :'provinceofvisit'}, //or
  {id: 186, name :'contactname'},
  {id: 331, name :'contacttitle'},
  {id: 332, name :'contactphonenumber'},

//previsit
  {id: 314, name :'measuresinplace'},
  {id: 315, name :'comfortable'},

//health survey
//questions
  {id:   7, name :'currentlysick'},
  {id:   8, name :'hadcontact'},
  {id:  10, name :'symptoms'},
  {id: 327, name :'symptomsnh'},
  {id: 328, name :'covidcontactnh'},
  {id: 330, name :'nonessentialtravelnh'},
  {id: 318, name :'preventmask'},
  {id: 259, name :'authcode'},

//post visit survey
  {id: 243, name :'aloneorpeople'},
  {id: 319, name :'numworkwith'},
  {id: 320, name :'contactsworkwith'},
  {id: 244, name :'safetymet'},
  {id: 321, name :'addressnoncompliance'},
  {id: 322, name :'corrections'},
]

var corrections = [
  {id: 10435,name:'morephysicaldistance',description: 'Enhanced physical distancing within work area'},
  {id: 10436,name:'askforchange',description: 'Ask for change to physical environment'},
  {id: 10437,name:'addedppe',description: 'Used Additional CNA provided PPE'},
  {id: 10438,name:'didnotgointoarea',description: 'Did not go into area'},
  {id: 10439,name:'rescheduledvisit',description: 'Rescheduled for a later date, time of day'},
  {id: 10440,name:'othercorrections',description: 'Other - Write In (Required)'},
]

var measures = [
  {id:10412,name:'socialdistancing',description:'Social Distancing (remaining at least 6 feet / 2 meters apart'},
  {id:10413,name:'facecoverings',description:'Mandatory Face Coverings'},
  {id:10414,name:'tracingplan',description:'Contact Tracing Plan to Notify People of Potential'},
  {id:10415,name:'healthsafetyplan',description:'Health & Safety Plan for COVID-19 (i.e., Basic steps to identify COVID-19 risks, including infection control, social distancing requirements, face coverings, and facility controls.)'},
  {id:10416,name:'employeehealth',description:'Employee Health Assessment (i.e., Preventative screening of SARS CoV-2 symptoms - e.g., questionnaire, temperature screening.)'},
  {id:10417,name:'visitorhealth',description:'Visitor Health Assessment (i.e., Preventative screening of SARS CoV-2 symptoms - e.g., questionnaire, temperature screening).'},
  {id:10638,name:'vendorprohibit',description:'Vendors are currently prohibited (this prevents me from completing the visit)'},
  {id:10418,name:'othermeasures',description:'Other'},
]

const prefix = 'https://api.alchemer.com/v5/'
const tokens = '?api_token=1a5544604fbeddb3754a6ea211b0184a98af2490c4e5717c04&api_token_secret=A9v1CwAMW5KfE'
var surveynum = '5758759'
var page = 1
var resultsperpage = 100

var numCompleteArray = []
var total_pages
var total_count

var numNotComplete = 0
var numComplete = 0
var numCompleteNull = 0

Go()

async function Go() {
  try {

    var url
    var urlstart = prefix + 'survey/' + surveynum + '/surveyresponse' + tokens + '&page' + page + '&resultsperpage=' + resultsperpage
    const result = await axios.get(urlstart);
    const httpResult = await result;
    console.log('httpResult.status',httpResult.status) //200
    var rootData = httpResult.data

    total_pages = rootData.total_pages
    total_count = rootData.total_count

    console.log('rootData.result_ok',rootData.result_ok)
    console.log('rootData.total_count',rootData.total_count)
    console.log('rootData.page',rootData.page)
    console.log('rootData.total_pages',rootData.total_pages)
    console.log('rootData.results_per_page',rootData.results_per_page)

    //total_pages = 1 //for testing

    while (page <= total_pages) {
      console.log('page',page,performance.now())
      url = prefix + 'survey/' + surveynum + '/surveyresponse' + tokens + '&page=' + page + '&resultsperpage=' + resultsperpage
      const result = await axios.get(url);
      const httpResult = await result;
      const rootData = httpResult.data
      const surveyData = rootData.data;
      var responsesArray = await processIt(surveyData)
      numCompleteArray.push(...responsesArray);
      page = page + 1
    }

    numCompleteArray = numCompleteArray.filter(response => response['status'] === "Complete")

    var oMeasures = calcmodule.MeasuresCalculations(numCompleteArray)
    var oComfortLevel = calcmodule.ComfortLevelCalculations(numCompleteArray)
    var oAuthorizations = calcmodule.AuthorizationsCalculations(numCompleteArray)
    var oHealthQuestions = calcmodule.HealthQuestionsCalculations(numCompleteArray)
    var oHealthQuestionsNH = calcmodule.HealthQuestionsNHCalculations(numCompleteArray)
    var oCorrections = calcmodule.CorrectionsCalculations(numCompleteArray)
    var oWorkAssignments = calcmodule.WorkAssignmentsCalculations(numCompleteArray)
    var oWorkWithCounts = calcmodule.WorkWithCountsCalculations(numCompleteArray)
    var oCompliance = calcmodule.ComplianceCalculations(numCompleteArray)
    var oAddressNonCompliance = calcmodule.AddressNonComplianceCalculations(numCompleteArray)
    var oCountries = calcmodule.CountriesCalculations(numCompleteArray)
    var oJobRoles = calcmodule.JobRolesCalculations(numCompleteArray)

    var oCalculations = {
      measures: oMeasures,
      comfortlevel: oComfortLevel,
      authorizations: oAuthorizations,
      healthquestions: oHealthQuestions,
      healthquestionsNH: oHealthQuestionsNH,
      corrections: oCorrections,
      workassignments: oWorkAssignments,
      workwithcounts: oWorkWithCounts,
      compliance: oCompliance,
      addressnoncompliance: oAddressNonCompliance,
      countries: oCountries,
      jobroles: oJobRoles,
    }

    var oBasic = {
      dategenerated: new Date().toISOString(),
      workassignmentsstart: oWorkAssignments[0].label,
      workassignmentsend: oWorkAssignments[oWorkAssignments.length-1].label,
      totalcount: total_count,
      numnotcomplete: numNotComplete,
      numcomplete: numComplete,
      numcompletenull: numCompleteNull,
    }

    var oResult = {...oBasic, ...oCalculations}

    var filesummary = './responses/covidsummary.json'
    var dataStringSummary = JSON.stringify(oResult, null, 2);
    fs.writeFileSync(filesummary, dataStringSummary);

    oResult.data = numCompleteArray
    var filedetail = './responses/coviddetail.json'
    var dataStringDetail = JSON.stringify(oResult, null, 2);
    fs.writeFileSync(filedetail, dataStringDetail);

    var duplicateIds = numCompleteArray
        .map(e => e['id'])
        .map((e, i, final) => final.indexOf(e) !== i && i)
        .filter(obj=> numCompleteArray[obj])
        .map(e => numCompleteArray[e]["id"])

    console.log('duplicateIds',duplicateIds)
    console.log('done',page,performance.now())
    console.log('done-minutes',page,performance.now()/60000)

  } catch(error) {
    console.log("error", error);
  }
}

function getIt() {
  var o = {}
  Object.keys(columns).forEach(key => {
    o[columns[key].name] = null
  })
  return o
}

async function processIt(responses) {
  var responsesArray = []
  responses.forEach(response => {
    if (response.status != 'Complete') {
      numNotComplete++
    }
    if (response.status == 'Complete') {
      numComplete++
    }
    if (response.status == null) {
      numCompleteNull++
    }
    var o = getIt()
    o.id = parseInt(response.id)
    o.datestarted = response.date_started
    o.datesubmitted = response.date_submitted
    o.status = response.status

    var data = response.survey_data
    Object.keys(data).forEach(key => {
      if (data[key].shown != false) {

        if (data[key].id === 259) { //authcode
          if (data[key].answer != undefined) {
            data[key].answer = parseInt(data[key].answer)
          }
          else {
            data[key].answer = null
          }
          data[key].type = "TEXTBOX"
        }

        if (data[key].id === 277) { //sessionid
          data[key].type = "TEXTBOX"
        }

        if (data[key].id === 315) { //comfortable
          if (data[key].answer == 'Yes, I am comfortable completing the visit') {
            data[key].answer = 'Yes'
          }
          if (data[key].answer == 'No, I am not comfortable completing the visit') {
            data[key].answer = 'No'
          }
          data[key].type = "TEXTBOX"
        }

        if (data[key].id === 319) { //numworkwith
          data[key].answer = parseInt(data[key].answer)
        }

        // if (data[key].id === 285) { //countryofvisit
        //   if (data[key].answer != null) {
        //     if (!countryofvisitArray.includes(data[key].answer)) {
        //       countryofvisitArray.push(data[key].answer)
        //     }
        //   }
        // }
        // if (data[key].id === 287) { //jobrole
        //   if (data[key].answer != null) {
        //     if (!jobroleArray.includes(data[key].answer)) {
        //       jobroleArray.push(data[key].answer)
        //     }
        //   }
        // }

        // if (data[key].id === 7) { //currentlysick
        //   if (data[key].answer == 'Yes') {
        //     totalcurrentlysick++
        //   }
        // }
        // if (data[key].id === 8) { //hadcontact
        //   if (data[key].answer == 'Yes') {
        //     totalhadcontact++
        //   }
        // }
        // if (data[key].id === 10) { //symptoms
        //   if (data[key].answer == 'Yes') {
        //     totalsymptoms++
        //   }
        // }


        // if (data[key].id === 327) { //symptomsnh
        //   if (data[key].answer == 'Yes') {
        //     totalsymptomsnh++
        //   }
        // }
        // if (data[key].id === 328) { //symptoms
        //   if (data[key].answer == 'Yes') {
        //     totalcovidcontactnh++
        //   }
        // }
        // if (data[key].id === 330) { //nonessentialtravelnh
        //   if (data[key].answer == 'Yes') {
        //     totalnonessentialtravelnh++
        //   }
        // }
        // if (data[key].id === 318) { //preventmask
        //   if (data[key].answer == 'Yes') {
        //     totalpreventmask++
        //   }
        // }



        //if aloneorpeople == "I worked alone" then numpeople = 0

//         if (data[key].id === 319) { //numpeople
//           var x = data[key].answer
//           switch(true){

//  //mjg
//             case (x == ''):

//               data[key].answer = parseInt(data[key].answer)
//               break

//               case (x == 0):
//                 workedwith0++
//                 data[key].answer = parseInt(data[key].answer)
//                 break

//             // case (x == 1):
//             //   workedwith0++
//             //   data[key].answer = parseInt(data[key].answer)
//             //   break
//             case (x < 4):
//               workedwith1to3++
//               data[key].answer = parseInt(data[key].answer)
//               break
//             case (x < 11):
//               workedwith4to10++
//               data[key].answer = parseInt(data[key].answer)
//               break
//             case (x < 26):
//               workedwith11to25++
//               data[key].answer = parseInt(data[key].answer)
//               break
//             default:
//               workedwithmorethan25++
//               break
//           }

//         }




        if (data[key].type != 'HIDDEN') {
          switch (data[key].type) {
            case 'TEXTBOX':
            case 'RADIO':
            case 'MENU':
            case 'ESSAY':
              var found3 = columns.find(element => parseInt(element.id) == parseInt(data[key].id))
              if (found3 != null) {
                o[found3.name] = data[key].answer
              }
              else {
                console.log('found is null',data[key].answer)
              }
              break
            case 'parent':
              if (data[key].id == 314) {
                //var found = columns.find(element => parseInt(element.id) == parseInt(data[key].id));
                var measuresarray = []
                Object.keys(data[key].options).forEach(key2 => {
                  var foundmeasure = measures.find(element => element.id == data[key].options[key2].id);
                  if (foundmeasure != undefined) {
                    measuresarray.push(foundmeasure.name)
                  }
                })
                //o[found.name] = measuresarray
                //console.log(measuresarray)
                measures.forEach(measure => {
                  //console.log(measure)
                  var foundmeasure2 = measuresarray.find(element => element == measure.name);
                  //console.log(foundmeasure2)
                  if (foundmeasure2 == undefined) {
                    o[measure.name] = false
                  }
                  else {
                    o[measure.name] = true
                  }
                })
              }
              if (data[key].id == 322) { //corrections
                //console.log('parent',data[key].id)
                //var found4 = columns.find(element => element.id == data[key].id);
                var correctionsarray = []
                Object.keys(data[key].options).forEach(key2 => {
                  //console.log(data[key].options[key2])
                  var foundcorrectnoncompliance = corrections.find(element => element.id == data[key].options[key2].id);
                  if (foundcorrectnoncompliance != undefined) {
                    correctionsarray.push(foundcorrectnoncompliance.name)
                  }
                })
                corrections.forEach(correctnoncompliance => {
                  //console.log(measure)
                  var foundcorrectnoncompliance2 = correctionsarray.find(element => element == correctnoncompliance.name);
                  //console.log(foundmeasure2)
                  if (foundcorrectnoncompliance2 == undefined) {
                    o[correctnoncompliance.name] = false
                  }
                  else {
                    o[correctnoncompliance.name] = true
                  }
                })
              }

              break
            default:
              break
          }
        }
      }
    });
    //done processing all keys in the data

    o['authorized'] = doAuthorized(o)

    //1 item
    responsesArray.push(o)
  })
  return responsesArray
}

function doAuthorized(o) {
  if (o['currentlysick'] == 'Yes' ||
      o['hadcontact'] == 'Yes' ||
      o['symptoms'] == 'Yes' ||
      o['symptomsnh'] == 'Yes' ||
      o['covidcontactnh'] == 'Yes' ||
      o['nonessentialtravelnh'] == 'Yes' ||
      o['preventmask'] == 'Yes'
  ) {
    o['authorized'] = 'No'
  }
  else {
    if (o['authcode'] != null) {
      //totalauthorized++
      o['authorized'] = 'Yes'
    }
    else {
      o['authorized'] = null
    }
  }
  return o['authorized']
}
