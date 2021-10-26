(function(exports){

  //filters
  exports.CountriesCalculations = function(allArray) {
    var countriesArray = []
    var i = 1;
    allArray.forEach(survey => {
      if(countriesArray.some(country => country.name === survey['countryofvisit'])){
      }
      else {
        countriesArray.push({id:i,name:survey['countryofvisit']})
        i++
      }
    })
    return countriesArray
  }

  exports.JobRolesCalculations = function(allArray) {
    var jobrolesArray = []
    var i = 1;
    allArray.forEach(survey => {
      if(jobrolesArray.some(country => country.name === survey['jobrole'])){
      }
      else {
        jobrolesArray.push({id:i,name:survey['jobrole']})
        i++
      }
    })
    return jobrolesArray
  }


  //pre-visit
  exports.ComfortLevelCalculations = function(allArray) {
    var num_responses = allArray.length
    var precision = 2

    var totalcomfortable = allArray.filter(response => response['comfortable'] === "Yes").length
    var totalnotcomfortable = allArray.filter(response => response['comfortable'] === "No").length

    var percentcomfortable = ((totalcomfortable/num_responses)*100).toFixed(precision)
    var percentnotcomfortable = ((totalnotcomfortable/num_responses)*100).toFixed(precision)

    var o = {
      denominator: num_responses,
      totalcomfortable,
      totalnotcomfortable,
      percentcomfortable,
      percentnotcomfortable,
    }
    return o
  }

  exports.MeasuresCalculations = function(allArray) {
      var num_responses = allArray.length
      var precision = 2

      var totalsocialdistancing = allArray.filter(response => response['socialdistancing'] === true).length
      var totalfacecoverings = allArray.filter(response => response['facecoverings'] === true).length
      var totaltracingplan = allArray.filter(response => response['tracingplan'] === true).length
      var totalhealthsafetyplan = allArray.filter(response => response['healthsafetyplan'] === true).length
      var totalemployeehealth = allArray.filter(response => response['employeehealth'] === true).length
      var totalvisitorhealth = allArray.filter(response => response['visitorhealth'] === true).length
      var totalvendorprohibit = allArray.filter(response => response['vendorprohibit'] === true).length
      var totalothermeasures = allArray.filter(response => response['othermeasures'] === true).length

      var percentsocialdistancing = ((totalsocialdistancing/num_responses)*100).toFixed(precision)
      var percentfacecoverings = ((totalfacecoverings/num_responses)*100).toFixed(precision)
      var percenttracingplan = ((totaltracingplan/num_responses)*100).toFixed(precision)
      var percenthealthsafetyplan = ((totalhealthsafetyplan/num_responses)*100).toFixed(precision)
      var percentemployeehealth = ((totalemployeehealth/num_responses)*100).toFixed(precision)
      var percentvisitorhealth = ((totalvisitorhealth/num_responses)*100).toFixed(precision)
      var percentvendorprohibit = ((totalvendorprohibit/num_responses)*100).toFixed(precision)
      var percentothermeasures = ((totalothermeasures/num_responses)*100).toFixed(precision)

      var o = {
        denominator: num_responses,
        totalsocialdistancing,
        totalfacecoverings,
        totaltracingplan,
        totalhealthsafetyplan,
        totalemployeehealth,
        totalvisitorhealth,
        totalvendorprohibit,
        totalothermeasures,
        percentsocialdistancing,
        percentfacecoverings,
        percenttracingplan,
        percenthealthsafetyplan,
        percentemployeehealth,
        percentvisitorhealth,
        percentvendorprohibit,
        percentothermeasures,
      }
      return o
  };


  //health assessment
  exports.AuthorizationsCalculations = function(allArray) {
    //var num_responses = allArray.length
    var precision = 2

    var totalassignments = allArray.filter(response => response['authorized'] !== null).length
    var totalauthorized = allArray.filter(response => response['authorized'] === "Yes").length
    var totalnotauthorized = allArray.filter(response => response['authorized'] === "No").length

    var percentauthorized = ((totalauthorized / totalassignments)*100).toFixed(precision)
    var percentnotauthorized = ((totalnotauthorized / totalassignments)*100).toFixed(precision)

    var o = {
      denominator: totalassignments,
      totalassignments,
      totalauthorized,
      totalnotauthorized,
      percentauthorized,
      percentnotauthorized,
    }
    return o
  }

  exports.WorkAssignmentsCalculations = function(allArray) {
      var daysArray = {}
      allArray.forEach(o => {
        if (daysArray[o['dateofvisit']] === undefined) {
          daysArray[o['dateofvisit']] = 1
        }
        else {
          daysArray[o['dateofvisit']] = daysArray[o['dateofvisit']] + 1
        }
      })

      var firstArray = []
      for (const [key, value] of Object.entries(daysArray)) {
        var a = {label: key, value: value}
        firstArray.push(a)
      }
      const sortedArray = firstArray.sort((a, b) => new Date(a.label) - new Date(b.label))
      return sortedArray
  }

  exports.HealthQuestionsAllCalculations = function(allArray) {
    //var num_responses = allArray.length
    //var precision = 0

    var totalcurrentlysick= allArray.filter(response => response['currentlysick'] === "Yes").length
    var totalhadcontact= allArray.filter(response => response['hadcontact'] === "Yes").length
    var totalsymptoms= allArray.filter(response => response['symptoms'] === "Yes").length
    var totalsymptomsnh= allArray.filter(response => response['symptomsnh'] === "Yes").length
    var totalcovidcontactnh= allArray.filter(response => response['covidcontactnh'] === "Yes").length
    var totalnonessentialtravelnh= allArray.filter(response => response['nonessentialtravelnh'] === "Yes").length
    //mjg var totalpreventmask= allArray.filter(response => response['preventmask'] === "Yes").length

    var o = {
      totalcurrentlysick,
      totalhadcontact,
      totalsymptoms,
      totalsymptomsnh,
      totalcovidcontactnh,
      totalnonessentialtravelnh,
      //totalpreventmask,
    }
    return o
  }

  exports.HealthQuestionsCalculations = function(allArray) {
    var totalsymptoms= allArray.filter(response => response['symptoms'] === "Yes").length
    var totalhadcontact= allArray.filter(response => response['hadcontact'] === "Yes").length
    var totalcurrentlysick= allArray.filter(response => response['currentlysick'] === "Yes").length

    var totalawaitingresults= allArray.filter(response => response['awaitingresults'] === "Yes").length
    var totaltraveledtowidespreadlocation= allArray.filter(response => response['traveledtowidespreadlocation'] === "Yes").length

    //var totalpreventmask= allArray.filter(response => response['preventmask'] === "Yes").length

    var o = {
      totalsymptoms,
      totalhadcontact,
      totalcurrentlysick,
      totalawaitingresults,
      totaltraveledtowidespreadlocation,
      //totalpreventmask,
    }
    return o
  }

  exports.HealthQuestionsNHCalculations = function(allArray) {
    var totalsymptomsnh= allArray.filter(response => response['symptomsnh'] === "Yes").length
    var totalcovidcontactnh= allArray.filter(response => response['covidcontactnh'] === "Yes").length
    var totalnonessentialtravelnh= allArray.filter(response => response['nonessentialtravelnh'] === "Yes").length

    var o = {
      totalsymptomsnh,
      totalcovidcontactnh,
      totalnonessentialtravelnh,
    }
    return o
  }


  //post-visit
  exports.WorkWithCountsCalculations = function(allArray) {
    var totalworkwithlength = allArray.filter(response => response['aloneorpeople'] !== null).length
    console.log(totalworkwithlength)

    var oResult = {
      totalworkwithlength: totalworkwithlength,
      denominator: totalworkwithlength,
      totalworkwith0: 0,
      totalworkwith1to3: 0,
      totalworkwith4to10: 0,
      totalworkwith11to25: 0,
      totalworkwithmorethan25: 0
    }
    allArray.forEach(o => {
      var x = o['numworkwith']
      //console.log(x,o['aloneorpeople'])
      switch(true){
        case (x === null):
          if (o['aloneorpeople'] == 'I worked alone') {
            console.log(o['id'],'0    ',x,o['aloneorpeople'])
            oResult['totalworkwith0']++
          }
          else {
            console.log(o['id'],'none ',x,o['aloneorpeople'])
          }
          break
        case (x === 0):
          oResult['totalworkwith0']++
          console.log(o['id'],'0    ',x,o['aloneorpeople'])
          break
        case (x < 4):
          oResult['totalworkwith1to3']++
          console.log(o['id'],'1-3  ',x,o['aloneorpeople'])
          break
        case (x < 11):
          oResult['totalworkwith4to10']++
          console.log(o['id'],'4-10 ',x,o['aloneorpeople'])
          break
        case (x < 26):
          oResult['totalworkwith11to25']++
          console.log(o['id'],'11-25',x,o['aloneorpeople'])
          break
        default:
          oResult['totalworkwithmorethan25']++
          console.log(o['id'],'>25',x,o['aloneorpeople'])
          break
      }
    })

    oResult['percentworkwith0'] = ((oResult['totalworkwith0'] / totalworkwithlength)*100).toFixed(2)
    oResult['percentworkwith1to3'] = ((oResult['totalworkwith1to3'] / totalworkwithlength)*100).toFixed(2)
    oResult['percentworkwith4to10'] = ((oResult['totalworkwith4to10'] / totalworkwithlength)*100).toFixed(2)
    oResult['percentworkwith11to25'] = ((oResult['totalworkwith11to25'] / totalworkwithlength)*100).toFixed(2)
    oResult['percentworkwithmorethan25'] = ((oResult['totalworkwithmorethan25'] / totalworkwithlength)*100).toFixed(2)

    console.log(oResult)
    return oResult
  }

  exports.ComplianceCalculations = function(allArray) {
    var precision = 2

    var complianceDenominator = allArray.filter(response => response['safetymet'] !== null).length
    var totalcompliant = allArray.filter(response => response['safetymet'] == 'Yes').length
    var totalnoncompliant = allArray.filter(response => response['safetymet'] == 'No').length

    var percentcompliant = ((totalcompliant/complianceDenominator)*100).toFixed(precision)
    var percentnoncompliant = ((totalnoncompliant/complianceDenominator)*100).toFixed(precision)

    var complianceArray = {
      denominator: complianceDenominator,
      totalcompliant: totalcompliant,
      totalnoncompliant: totalnoncompliant,
      percentcompliant: percentcompliant,
      percentnoncompliant: percentnoncompliant,
    }
    return complianceArray
  }

  exports.AddressNonComplianceCalculations = function(allArray) {
    var num_responses = allArray.length
    var precision = 2

    var totaladdressnoncompliance = allArray.filter(response => response['addressnoncompliance'] === "Yes").length
    var totalnotaddressnoncompliance = allArray.filter(response => response['addressnoncompliance'] === "No").length

    var percentaddressnoncompliance = ((totaladdressnoncompliance/num_responses)*100).toFixed(precision)
    var percentnotaddressnoncompliance = ((totalnotaddressnoncompliance/num_responses)*100).toFixed(precision)

    var o = {
      denominator: num_responses,
      totaladdressnoncompliance,
      totalnotaddressnoncompliance,
      percentaddressnoncompliance,
      percentnotaddressnoncompliance,
    }
    return o
  }

  exports.CorrectionsCalculations = function(allArray) {
    var precision = 2

    var correctionsDenominator = allArray.filter(response => response['addressnoncompliance'] === 'Yes').length

    var totalmorephysicaldistance = allArray.filter(response => response['morephysicaldistance'] === true).length
    var totalaskforchange = allArray.filter(response => response['askforchange'] === true).length
    var totaladdedppe = allArray.filter(response => response['addedppe'] === true).length
    var totaldidnotgointoarea = allArray.filter(response => response['didnotgointoarea'] === true).length
    var totalrescheduledvisit = allArray.filter(response => response['rescheduledvisit'] === true).length
    var totalothercorrections = allArray.filter(response => response['othercorrections'] === true).length

    var percentmorephysicaldistance = ((totalmorephysicaldistance/correctionsDenominator)*100).toFixed(precision)
    var percentaskforchange = ((totalaskforchange/correctionsDenominator)*100).toFixed(precision)
    var percentaddedppe = ((totaladdedppe/correctionsDenominator)*100).toFixed(precision)
    var percentdidnotgointoarea = ((totaldidnotgointoarea/correctionsDenominator)*100).toFixed(precision)
    var percentrescheduledvisit = ((totalrescheduledvisit/correctionsDenominator)*100).toFixed(precision)
    var percentothercorrections = ((totalothercorrections/correctionsDenominator)*100).toFixed(precision)

    var o = {
      denominator: correctionsDenominator,
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


  //consultant compliance
  exports.DayOfHealthAssessmentCalculations = function(allArray) {
    var visitinfutureArray = allArray.filter(response => new Date(response['dateofvisit']) > new Date())
    var visitinfuture = visitinfutureArray.length

    var visitArray = allArray.filter(response => new Date(response['dateofvisit']) <= new Date())
    var assessmentCompleteArray = visitArray.filter(response => response['currentlysick'] !== null)
    var completed = assessmentCompleteArray.length
    //console.log(completed)
    var assessmentNotCompleteArray = visitArray.filter(response => response['currentlysick'] === null)
    var notcompleted = assessmentNotCompleteArray.length
    //console.log(notcompleted)
    return {completed:completed,notcompleted:notcompleted,visitinfuture:visitinfuture}
  }

  exports.FiveDayPostVisitCalculations = function(allArray) {

    var authArray = allArray.filter(response => response['authcode'] !== null)
    var denominator = authArray.length
    //console.log('denominator',denominator)
    var notcompletedArray = authArray.filter(response => response['aloneorpeople'] === null)

    var totalnotcompletedIn5 = 0
    var totalnotcompletedAfter5 = 0
    notcompletedArray.forEach(o => {
      var today = new Date()
      var visit = new Date(o['dateofvisit'])
      var difference = today.getTime() - visit.getTime();
      var days = Math.ceil(difference / (1000 * 3600 * 24));
      if (days > 5) {
        totalnotcompletedAfter5++
      }
      else {
        totalnotcompletedIn5++
      }
    })

    //var notcompletedwithin5days = notcompletedArray.filter(response => new Date(response['dateofvisit']) <= new Date())
    var totalNotCompleted = notcompletedArray.length
    //console.log('not completed',totalNotCompleted)


    var completedArray = authArray.filter(response => response['aloneorpeople'] !== null)
    var totalcompletedIn5 = 0
    var totalcompletedAfter5 = 0
    completedArray.forEach(o => {
      var submitted = new Date(o['datesubmitted'])
      var visit = new Date(o['dateofvisit'])
      var difference = submitted.getTime() - visit.getTime();
      var days = Math.ceil(difference / (1000 * 3600 * 24));
      if (days > 5) {
        totalcompletedAfter5++
      }
      else {
        totalcompletedIn5++
      }
    })
    //console.log('in 5',totalIn5)
    //console.log('after 5',totalAfter5)
    //var total = totalNotCompleted + totalIn5 + totalAfter5
    //console.log('total',total)
    var percentNotCompleted = ((totalNotCompleted/denominator)*100).toFixed(2)
    //var percentIn5 = ((totalIn5/denominator)*100).toFixed(2)
    //var percentAfter5 = ((totalAfter5/denominator)*100).toFixed(2)
    var o = {
      totalcompletedAfter5:totalcompletedAfter5,
      totalcompletedIn5:totalcompletedIn5,
      totalnotcompletedAfter5:totalnotcompletedAfter5,
      totalnotcompletedIn5:totalnotcompletedIn5,

      //totalNotCompleted: totalNotCompleted,
      //totalIn5: totalIn5,
      //totalAfter5: totalAfter5,
      //percentNotCompleted: percentNotCompleted,
      //percentIn5: percentIn5,
      //percentAfter5: percentAfter5
    }
    return o
  }



  })(typeof exports === 'undefined'? this['calcmodule']={}: exports);