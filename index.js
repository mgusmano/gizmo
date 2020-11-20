const axios = require('axios').default;
const { SSL_OP_MSIE_SSLV2_RSA_PADDING } = require('constants');
const fs = require("fs-extra");
const {performance} = require('perf_hooks');

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
  {id: 319, name :'numpeople'},
  {id: 320, name :'contactsworkedwith'},
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
//Venders are curr
  {id:10418,name:'othermeasures',description:'Other'},
]

const prefix = 'https://api.alchemer.com/v5/'
const tokens = '?api_token=1a5544604fbeddb3754a6ea211b0184a98af2490c4e5717c04&api_token_secret=A9v1CwAMW5KfE'
var surveynum = '5758759'
var page = 1
var resultsperpage = 100

var num_responses = 0
var allArray = []
var total_pages
var total_count

var totalcurrentlysick = 0
var totalhadcontact = 0
var totalsymptoms = 0
var totalsymptomsnh = 0
var totalcovidcontactnh = 0
var totalnonessentialtravelnh = 0
var totalpreventmask = 0

var workedwith0 = 0
var workedwith1to3 = 0
var workedwith4to10 = 0
var workedwith11to25 = 0
var workedwithmorethan25 = 0

var countryofvisitArray=[]
var jobroleArray=[]

var daysArray = {}

var numNotComplete = 0
var numComplete = 0
var numCompleteNull = 0

Go()

async function Go() {
  try {

    var url
    //var num
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
      //num = page * resultsperpage
      const result = await axios.get(url);
      const httpResult = await result;
      const rootData = httpResult.data
      const surveyData = rootData.data;
      var responsesArray = await processIt(surveyData)
      console.log('after processIt')
      allArray.push(...responsesArray);
      page = page + 1
    }


    console.log('allArray.length',allArray.length)
    //console.log('total_count',total_count)
    //console.log('num_responses',num_responses)

function MeasuresCalculations(allArray) {
  var num_responses = allArray.length
  var precision = 0

  totalsocialdistancing= allArray.filter(response => response['socialdistancing'] == true).length
  totalfacecoverings= allArray.filter(response => response['facecoverings'] == true).length
  totaltracingplan= allArray.filter(response => response['tracingplan'] == true).length
  totalhealthsafetyplan= allArray.filter(response => response['healthsafetyplan'] == true).length
  totalemployeehealth= allArray.filter(response => response['employeehealth'] == true).length
  totalvisitorhealth= allArray.filter(response => response['visitorhealth'] == true).length
  totalothermeasures= allArray.filter(response => response['othermeasures'] == true).length

  percentsocialdistancing= ((totalsocialdistancing/num_responses)*100).toFixed(precision)
  percentfacecoverings= ((totalfacecoverings/num_responses)*100).toFixed(precision)
  percenttracingplan= ((totaltracingplan/num_responses)*100).toFixed(precision)
  percenthealthsafetyplan= ((totalhealthsafetyplan/num_responses)*100).toFixed(precision)
  percentemployeehealth= ((totalemployeehealth/num_responses)*100).toFixed(precision)
  percentvisitorhealth= ((totalvisitorhealth/num_responses)*100).toFixed(precision)
  percentothermeasures= ((totalothermeasures/num_responses)*100).toFixed(precision)

  var o = {
    totalsocialdistancing,
    totalfacecoverings,
    totaltracingplan,
    totalhealthsafetyplan,
    totalemployeehealth,
    totalvisitorhealth,
    totalothermeasures,
    percentsocialdistancing,
    percentfacecoverings,
    percenttracingplan,
    percenthealthsafetyplan,
    percentemployeehealth,
    percentvisitorhealth,
    percentothermeasures,
  }
  return o
}

function CorrectionsCalculations(allArray) {
  var num_responses = allArray.length
  var precision = 0

  totalmorephysicaldistance= allArray.filter(response => response['morephysicaldistance'] == true).length
  totalaskforchange= allArray.filter(response => response['askforchange'] == true).length
  totaladdedppe= allArray.filter(response => response['addedppe'] == true).length
  totaldidnotgointoarea= allArray.filter(response => response['didnotgointoarea'] == true).length
  totalrescheduledvisit= allArray.filter(response => response['rescheduledvisit'] == true).length
  totalothercorrections= allArray.filter(response => response['othercorrections'] == true).length

  percentmorephysicaldistance= ((totalmorephysicaldistance/num_responses)*100).toFixed(precision)
  percentaskforchange= ((totalaskforchange/num_responses)*100).toFixed(precision)
  percentaddedppe= ((totaladdedppe/num_responses)*100).toFixed(precision)
  percentdidnotgointoarea= ((totaldidnotgointoarea/num_responses)*100).toFixed(precision)
  percentrescheduledvisit= ((totaldidnotgointoarea/num_responses)*100).toFixed(precision)
  percentothercorrections= ((totalothercorrections/num_responses)*100).toFixed(precision)

  var o = {

totalmorephysicaldistance,
totalaskforchange,
totaladdedppe,
totaldidnotgointoarea,
totalrescheduledvisit,
totalothercorrections,
percentmorephysicaldistance,
percentaskforchange,
percentaddedppe,
percentdidnotgointoarea,
percentrescheduledvisit,
percentothercorrections,
  }
  return o
}

function ComfortLevelCalculations(allArray) {
  var num_responses = allArray.length
  var precision = 0

  totalcomfortable= allArray.filter(response => response['comfortable'] === "Yes").length

  totalcomfortable= allArray.filter(response => response['comfortable'] === "Yes").length
  totalnotcomfortable= allArray.filter(response => response['comfortable'] === "No").length

  percentcomfortable= ((totalcomfortable/num_responses)*100).toFixed(precision)
  percentnotcomfortable= ((totalnotcomfortable/num_responses)*100).toFixed(precision)

  var o = {
    totalcomfortable,
    totalnotcomfortable,
    percentcomfortable,
    percentnotcomfortable,
  }
  return o
}

function AuthorizationCalculations(allArray) {
  var num_responses = allArray.length
  var precision = 2

  totalassignments= allArray.filter(response => response['authorized'] !== null).length
  totalauthorized= allArray.filter(response => response['authorized'] === "Yes").length
  totalnotauthorized= allArray.filter(response => response['authorized'] === "No").length

  percentauthorized= ((totalauthorized / totalassignments)*100).toFixed(precision)
  percentnotauthorized= ((totalnotauthorized / totalassignments)*100).toFixed(precision)

  var o = {
    totalassignments,
    totalauthorized,
    totalnotauthorized,
    percentauthorized,
    percentnotauthorized,
  }
  return o
}

function HealthQuestionCalculations(allArray) {
  //var num_responses = allArray.length
  //var precision = 0

  totalcurrentlysick= allArray.filter(response => response['currentlysick'] === "Yes").length
  totalhadcontact= allArray.filter(response => response['hadcontact'] === "Yes").length
  totalsymptoms= allArray.filter(response => response['symptoms'] === "Yes").length
  totalsymptomsnh= allArray.filter(response => response['symptomsnh'] === "Yes").length
  totalcovidcontactnh= allArray.filter(response => response['covidcontactnh'] === "Yes").length
  totalnonessentialtravelnh= allArray.filter(response => response['nonessentialtravelnh'] === "Yes").length
  totalpreventmask= allArray.filter(response => response['preventmask'] === "Yes").length

  var o = {
    totalcurrentlysick,
    totalhadcontact,
    totalsymptoms,
    totalsymptomsnh,
    totalcovidcontactnh,
    totalnonessentialtravelnh,
    totalpreventmask,
  }
  return o
}


    var allCompleteArray= allArray.filter(response => response['status'] === "Complete")
    var oMeasures = MeasuresCalculations(allCompleteArray)
    var oComfortLevel = ComfortLevelCalculations(allCompleteArray)
    var oAuthorization = AuthorizationCalculations(allCompleteArray)
    var oHealthQuestion = HealthQuestionCalculations(allCompleteArray)
    var oCorrections = CorrectionsCalculations(allCompleteArray)

    var oBasic = {
      dategenerated: new Date().toISOString(),
      totalcount: total_count,
      numnotcomplete: numNotComplete,
      numcomplete: numComplete,
      numcompletenull: numCompleteNull,

      // //PreVisitCalculations
      // totalsocialdistancing: allArray.filter(response => response['socialdistancing'] == true).length,
      // totalfacecoverings: allArray.filter(response => response['facecoverings'] == true).length,
      // totaltracingplan: allArray.filter(response => response['tracingplan'] == true).length,
      // totalhealthsafetyplan: allArray.filter(response => response['healthsafetyplan'] == true).length,
      // totalemployeehealth: allArray.filter(response => response['employeehealth'] == true).length,
      // totalvisitorhealth: allArray.filter(response => response['visitorhealth'] == true).length,
      // totalother: allArray.filter(response => response['other'] == true).length,

      // percentsocialdistancing: (((allArray.filter(response => response['socialdistancing'] == true).length)/num_responses)*100).toFixed(0),
      // percentfacecoverings: (((allArray.filter(response => response['facecoverings'] == true).length)/num_responses)*100).toFixed(0),
      // percenttracingplan: (((allArray.filter(response => response['tracingplan'] == true).length)/num_responses)*100).toFixed(0),
      // percenthealthsafetyplan: (((allArray.filter(response => response['healthsafetyplan'] == true).length)/num_responses)*100).toFixed(0),
      // percentemployeehealth: (((allArray.filter(response => response['employeehealth'] == true).length)/num_responses)*100).toFixed(0),
      // percentvisitorhealth: (((allArray.filter(response => response['visitorhealth'] == true).length)/num_responses)*100).toFixed(0),
      // percentother: (((allArray.filter(response => response['other'] == true).length)/num_responses)*100).toFixed(0),

      // totalcomfortable: allArray.filter(response => response['comfortable'] === "Yes").length,
      // totalnotcomfortable: allArray.filter(response => response['comfortable'] === "No").length,

      // totalassignments: allArray.filter(response => response['authorized'] !== null).length,
      // totalauthorized: allArray.filter(response => response['authorized'] === "Yes").length,
      // totalnotauthorized: allArray.filter(response => response['authorized'] === "No").length,
      // percentauthorized: (( allArray.filter(response => response['authorized'] === "Yes").length / allArray.filter(response => response['authorized'] !== null).length)*100).toFixed(2),
      // percentnotauthorized: (( allArray.filter(response => response['authorized'] === "No").length / allArray.filter(response => response['authorized'] !== null).length)*100).toFixed(2),



      totalworkedwith0: workedwith0,
      totalworkedwith1to3: workedwith1to3,
      totalworkedwith4to10: workedwith4to10,
      totalworkedwith11to25: workedwith11to25,
      totalworkedwithmorethan25: workedwithmorethan25,

      countryofvisitArray: countryofvisitArray,
      jobroleArray:jobroleArray,
      days: daysArray,

      // totalcurrentlysick:totalcurrentlysick,
      // totalhadcontact:totalhadcontact,
      // totalsymptoms:totalsymptoms,
      // totalsymptomsnh:totalsymptomsnh,
      // totalcovidcontactnh:totalcovidcontactnh,
      // totalnonessentialtravelnh:totalnonessentialtravelnh,
      // totalpreventmask:totalpreventmask,
    }

    var oResult = { ...oBasic, ...oHealthQuestion, ...oMeasures, ...oComfortLevel, ...oAuthorization, ...oCorrections}


    var filesummary = './responses/covidsummary.json'
    var dataStringSummary = JSON.stringify(oResult, null, 2);
    fs.writeFileSync(filesummary, dataStringSummary);

    oResult.data = allArray
    var filedetail = './responses/coviddetail.json'
    var dataStringDetail = JSON.stringify(oResult, null, 2);
    fs.writeFileSync(filedetail, dataStringDetail);

    var duplicateIds = allArray
        .map(e => e['id'])
        .map((e, i, final) => final.indexOf(e) !== i && i)
        .filter(obj=> allArray[obj])
        .map(e => allArray[e]["id"])

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
    num_responses++

    var data = response.survey_data
    Object.keys(data).forEach(key => {
      if (data[key].shown != false) {


        if (data[key].id === 285) { //countryofvisit
          if (data[key].answer != null) {
            if (!countryofvisitArray.includes(data[key].answer)) {
              countryofvisitArray.push(data[key].answer)
            }
          }
        }
        if (data[key].id === 287) { //jobrole
          if (data[key].answer != null) {
            if (!jobroleArray.includes(data[key].answer)) {
              jobroleArray.push(data[key].answer)
            }
          }
        }
        if (data[key].id === 259) { //authcode
          if (data[key].answer != undefined) {
//            totalauthorized++
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

        if (data[key].id === 315) { //comfortable
          if (data[key].answer == 'Yes, I am comfortable completing the visit') {
            data[key].answer = 'Yes'
          }
          if (data[key].answer == 'No, I am not comfortable completing the visit') {
            data[key].answer = 'No'
          }
          data[key].type = "TEXTBOX"
        }
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

        if (data[key].id === 319) { //numpeople
          var x = data[key].answer
          switch(true){

 //mjg
            case (x == ''):

              data[key].answer = parseInt(data[key].answer)
              break

              case (x == 0):
                workedwith0++
                data[key].answer = parseInt(data[key].answer)
                break

            // case (x == 1):
            //   workedwith0++
            //   data[key].answer = parseInt(data[key].answer)
            //   break
            case (x < 4):
              workedwith1to3++
              data[key].answer = parseInt(data[key].answer)
              break
            case (x < 11):
              workedwith4to10++
              data[key].answer = parseInt(data[key].answer)
              break
            case (x < 26):
              workedwith11to25++
              data[key].answer = parseInt(data[key].answer)
              break
            default:
              workedwithmorethan25++
              break
          }

        }
        if (data[key].type != 'HIDDEN') { // || (data[key].type == 'HIDDEN' && data[key].id === 259)) {
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
                //console.log(columns)
                console.log('found is null')
                //console.log(data[key].id)
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

    if (daysArray[o['dateofvisit']] == undefined) {
      daysArray[o['dateofvisit']] = 1
    }
    else {
      daysArray[o['dateofvisit']] = daysArray[o['dateofvisit']] + 1
    }

    o['authorized'] = doAuthorized(o)
    // if (o['currentlysick'] == 'Yes' ||
    //     o['hadcontact'] == 'Yes' ||
    //     o['symptoms'] == 'Yes' ||
    //     o['symptomsnh'] == 'Yes' ||
    //     o['covidcontactnh'] == 'Yes' ||
    //     o['nonessentialtravelnh'] == 'Yes' ||
    //     o['preventmask'] == 'Yes'
    // ) {
    //   o['authorized'] = 'No'
    // }
    // else {
    //   if (o['authcode'] != null) {
    //     totalauthorized++
    //     o['authorized'] = 'Yes'
    //   }
    //   else {
    //     o['authorized'] = null
    //   }
    // }

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
