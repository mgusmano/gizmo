const axios = require('axios').default;
const fs = require("fs-extra");
const {performance} = require('perf_hooks');

var columns =[
  {id:   1, name :'id'},
  {id:   2, name :'datestarted'},
  {id:   3, name :'datesubmitted'},
  {id:   4, name :'status'},

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
  {id: 322, name :'correctnoncompliance'},
]

var measures = [
  {id:10412,name:'socialdistancing',description:'Social Distancing (remaining at least 6 feet / 2 meters apart'},
  {id:10413,name:'facecoverings',description:'Mandatory Face Coverings'},
  {id:10414,name:'tracingplan',description:'Contact Tracing Plan to Notify People of Potential'},
  {id:10415,name:'healthsafetyplan',description:'Health & Safety Plan for COVID-19 (i.e., Basic steps to identify COVID-19 risks, including infection control, social distancing requirements, face coverings, and facility controls.)'},
  {id:10416,name:'employeehealth',description:'Employee Health Assessment (i.e., Preventative screening of SARS CoV-2 symptoms - e.g., questionnaire, temperature screening.)'},
  {id:10417,name:'visitorhealth',description:'Visitor Health Assessment (i.e., Preventative screening of SARS CoV-2 symptoms - e.g., questionnaire, temperature screening).'},
//Venders are curr
  {id:10418,name:'other',description:'Other'},
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
var num
var totalauthorized = 0



var workedwith0 = 0
var workedwith1to3 = 0
var workedwith4to10 = 0
var workedwith11to25 = 0
var workedwithmorethan25 = 0


Go()


async function Go() {
  try {

    var url
    var urlstart = prefix + 'survey/' + surveynum + '/surveyresponse' + tokens + '&page' + page + '&resultsperpage=' + resultsperpage
    const result = await axios.get(urlstart);
    const data = await result;

    total_pages = data.data.total_pages
    total_count = data.data.total_count

    //console.log('result_ok',data.data.result_ok)
    console.log('total_count',data.data.total_count)
    //console.log('page',data.data.page)
    console.log('total_pages',data.data.total_pages)
    console.log('results_per_page',data.data.results_per_page)


    while (page <= total_pages) {
      console.log('page',page,performance.now())
      url = prefix + 'survey/' + surveynum + '/surveyresponse' + tokens + '&page=' + page + '&resultsperpage=' + resultsperpage
      //console.log(url)
      num = page * resultsperpage
      const result = await axios.get(url);
      const data1 = await result;

      // console.log('result_ok',data1.data.result_ok)
      // console.log('total_count',data1.data.total_count)
      // console.log('page',data1.data.page)
      // console.log('total_pages',data1.data.total_pages)
      // console.log('results_per_page',data1.data.results_per_page)
      // console.log('total_pages',data1.data.total_pages)

      const data = data1.data.data;
      //console.log('length',data.length)
      var responsesArray = await processIt(data)
      //allArray = allArray.concat(responsesArray)
      allArray.push(...responsesArray);
      page = page + 1
    }
    var file = './responses/responses' + num + '.json'
    console.log('allArray',allArray.length)


    console.log('total_count',total_count)
    console.log('num_responses',num_responses)



    var oResult = {
      dategenerated: new Date().toISOString(),

      socialdistancing: allArray.filter(response => response['socialdistancing'] == true).length,
      facecoverings: allArray.filter(response => response['facecoverings'] == true).length,
      tracingplan: allArray.filter(response => response['tracingplan'] == true).length,
      healthsafetyplan: allArray.filter(response => response['healthsafetyplan'] == true).length,
      employeehealth: allArray.filter(response => response['employeehealth'] == true).length,
      visitorhealth: allArray.filter(response => response['visitorhealth'] == true).length,
      other: allArray.filter(response => response['other'] == true).length,

      socialdistancingpercent: (((allArray.filter(response => response['socialdistancing'] == true).length)/num_responses)*100).toFixed(0),
      facecoveringspercent: (((allArray.filter(response => response['facecoverings'] == true).length)/num_responses)*100).toFixed(0),
      tracingplanpercent: (((allArray.filter(response => response['tracingplan'] == true).length)/num_responses)*100).toFixed(0),
      healthsafetyplanpercent: (((allArray.filter(response => response['healthsafetyplan'] == true).length)/num_responses)*100).toFixed(0),
      employeehealthpercent: (((allArray.filter(response => response['employeehealth'] == true).length)/num_responses)*100).toFixed(0),
      visitorhealthpercent: (((allArray.filter(response => response['visitorhealth'] == true).length)/num_responses)*100).toFixed(0),
      otherpercent: (((allArray.filter(response => response['other'] == true).length)/num_responses)*100).toFixed(0),



      totalassignments: total_count,
      totalauthorized: totalauthorized,
      totalnotauthorized: total_count - totalauthorized,
      percentauthorized: ((totalauthorized / total_count)*100).toFixed(0),

      workedwith0: workedwith0,
      workedwith1to3: workedwith1to3,
      workedwith4to10: workedwith4to10,
      workedwith11to25: workedwith11to25,
      workedwithmorethan25: workedwithmorethan25,

      data: allArray
    }

    var dataString = JSON.stringify(oResult, null, 2);


    fs.writeFileSync(file, dataString);



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
    var o = getIt()
    o.id = response.id
    o.datestarted = response.date_started
    o.datesubmitted = response.date_submitted
    o.status = response.status
    num_responses++
    if (num_responses != 20000) { //negate the if
      var data = response.survey_data
      Object.keys(data).forEach(key => {
        if (data[key].shown != false) {
          if (data[key].id === 259) { //authcode
            if (data[key].answer != undefined) {
              totalauthorized++
            }
            data[key].type = "TEXTBOX"
          }
          if (data[key].id === 277) { //sessionid
            data[key].type = "TEXTBOX"
          }
          if (data[key].id === 319) { //numpeople
            var x = data[key].answer
            switch(true){
              case (x < 1):
                workedwith0++
                break
              case (x < 4):
                workedwith1to3++
                break
              case (x < 11):
                workedwith4to10++
                break
              case (x < 26):
                workedwith11to25++
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
                var found = columns.find(element => element.id == data[key].id);
                o[found.name] = data[key].answer
                break
              case 'parent':
                var found = columns.find(element => element.id == data[key].id);
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
                break
              default:
                break
            }
          }
        }
      });

    }
    else {
      //console.log('skipped')
    }
    responsesArray.push(o)
  })
  return responsesArray
}



// return
// while (page < 10) {

//   paging = '&page' + page + '&resultsperpage=' + resultsperpage
//   url = prefix + 'survey/' + surveynum + '/surveyresponse' + tokens + paging
//   console.log(url)
//   console.log(performance.now())


//   //var count = 0

//   axios
//   .get(url, {
//   })
//   .then((result) => {
//     console.log('got result',performance.now())
//     //console.log(performance.now())
//     var responses = result.data.data

//     //console.log(responses)

//     var responsesArray = []
//     responses.forEach(response => {
//       //count = count + 1
//       var o = {}
//       num_responses++
//       //console.log(num_responses)
//       if (num_responses != 20000) {
//         //console.log(result.data)
//         var data = response.survey_data
//         Object.keys(data).forEach(key => {
//           if (data[key].shown != false) {
//             if (data[key].type != 'HIDDEN') {
//               switch (data[key].type) {
//                 case 'TEXTBOX':
//                 case 'RADIO':
//                 case 'MENU':
//                 case 'ESSAY':
//                   var found = columns.find(element => element.id == data[key].id);
//                   o[found.name] = data[key].answer
//                   break
//                 case 'parent':
//                   var found = columns.find(element => element.id == data[key].id);
//                   var measuresarray = []
//                   Object.keys(data[key].options).forEach(key2 => {
//                     var foundmeasure = measures.find(element => element.id == data[key].options[key2].id);
//                     measuresarray.push(foundmeasure.name)
//                   })

//                   //o[found.name] = measuresarray
//                   //console.log(measuresarray)
//                   measures.forEach(measure => {
//                     //console.log(measure)
//                     var foundmeasure2 = measuresarray.find(element => element == measure.name);
//                     //console.log(foundmeasure2)
//                     if (foundmeasure2 == undefined) {
//                       o[measure.name] = false
//                     }
//                     else {
//                       o[measure.name] = true
//                     }
//                   })
//                   break
//                 default:
//                   break
//               }
//             }
//           }
//         });

//       }
//       else {
//         //console.log('skipped')
//       }
//       responsesArray.push(o)
//     })

//     var num = page * resultsperpage
//     var file = './responses' + num + '.json'
//     const dataString = JSON.stringify(responsesArray, null, 2);
//     fs.writeFileSync(file, dataString);





//     // console.log('socialdistancing',(responsesArray.filter(response => response['socialdistancing'] == true).length)/num_responses)
//     // console.log('facecoverings',(responsesArray.filter(response => response['facecoverings'] == true).length)/num_responses)
//     // console.log('tracingplan',(responsesArray.filter(response => response['tracingplan'] == true).length)/num_responses)
//     // console.log('healthsafetyplan',(responsesArray.filter(response => response['healthsafetyplan'] == true).length)/num_responses)
//     // console.log('employeehealth',(responsesArray.filter(response => response['employeehealth'] == true).length)/num_responses)
//     // console.log('visitorhealth',(responsesArray.filter(response => response['visitorhealth'] == true).length)/num_responses)
//     // console.log('other',(responsesArray.filter(response => response['other'] == true).length)/num_responses)



//   })
//   .catch((error) => {
//     console.log(error)
//   })

//   page++;
// }
// //console.log(responsesArray)
// console.log('responses: ',num_responses)
// console.log('finish',performance.now())





