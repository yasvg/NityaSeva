var SEARCH = {
  searchArr: [],
  init: function() {
    SEARCH.searchArr = [
      {idx: 1, name: "All members", value:"all_members", subCatType: "select", subCatValues: ["All"]},
      {idx: 2, name: "Member Name", value:"member_name", subCatType: "inputText"},
      {idx: 3, name: "Phone Num", value:"phone_num", subCatType: "inputText"},
      {idx: 4, name: "Donation Category", value:"donation_category", subCatType: "select", url: "member/schemelist", ddKey: "scheme_name"},
      {idx: 5, name: "Active Member", value:"active_member", subCatType: "select", subCatValues: ["Y", "N"]},
      {idx: 6, name: "Payment Due Report", value:"payment_due_report", subCatType: "dateRange"},
      {idx: 7, name: "Date of Payment", value:"date_of_payment", subCatType: "dateRange"},
      {idx: 8, name: "Corresponder", value:"corresponder_name", subCatType: "select", url: "member/corresponderlist", ddKey: "corresponder_name"},
      {idx: 9, name: "Connected To", value:"connected_to", subCatType: "select", url: "member/connectedlist", ddKey: "connected_to"}
    ];

    //Create Category Drop Down
    var optionList = "<option value='none'>Select</option>";
    for(var i=0; i<SEARCH.searchArr.length; i++){
      var obj = SEARCH.searchArr[i];

      optionList += "<option value='"+obj['value']+"' data-idx='"+obj['idx']+"' data-subtype='"
      +obj['subCatType']+"'>"+obj["name"]+"</option>";
    }

    $("#category").html(optionList);
    $("#date_range").hide();
  },
  bindEvents: function(){
    $("#search_result .user_id").off("click").on("click", function(){
      var id = $(this).text();
      localStorage.setItem("member_id", id);
    });
  },
  showSubCategory: function(event){
    var el = event.target;
    var optionIdx = $(el).find("option:selected").data("idx");
    if(optionIdx > 0) {
      var selectedOption = SEARCH.searchArr[optionIdx - 1];
      var subCategoryType = selectedOption.subCatType;
      var subCatValues = selectedOption.subCatValues;
      var url = selectedOption.url;
      var inside_conditions = false;
      if(url){
        inside_conditions = true;
        var ddKey = selectedOption.ddKey;
        $.ajax({
          url: CONSTANTS.API_PATH + url,
          type: "GET",
          dataType: "json",
          success: function(data, statusTxt){
            console.log(data, statusTxt);
            var optionList = "<option value='none'>Select</option>";
            // if(data.success === 1){
              if(data.output.length > 0){
                var subCatArr = data.output;
                for (var i=0; i<subCatArr.length; i++) {
                  optionList += "<option>"+subCatArr[i][ddKey]+"</option>";
                }

                $("#sub_category_select").html(optionList);
                $("#sub_category_input_text").hide();
                $("#date_range").hide();
                $("#sub_cat").show();
                $("#sub_category_select").show();
              }
          },
          error: function(xhr, status){
            console.log(xhr, status);
            COMMON.logoutRedirect(xhr);
          }
        });
      } else if (subCatValues) {
        inside_conditions = true;
        var optionList = "<option value='none'>Select</option>";
        for (var i=0; i<subCatValues.length; i++) {
          optionList += "<option>"+subCatValues[i]+"</option>";
        }

        $("#sub_category_select").html(optionList);
        $("#sub_category_input_text").hide();
        $("#date_range").hide();
        $("#sub_cat").show();
        $("#sub_category_select").show();
      } else if (subCategoryType === "inputText") {
        inside_conditions = true;
        $("#sub_category_select").hide();
        $("#date_range").hide();
        $("#sub_cat").show();
        $("#sub_category_input_text").val("");
        $("#sub_category_input_text").show();
        $("#sub_category_input_text").off("keydown").on("keydown", function(event){
          var key = event.which || event.keyCode;
          if(key === 13){
            $("#search_btn").click();
          }
        });
      }else if (subCategoryType === "dateRange") {
        inside_conditions = true;
        $("#sub_cat").hide();
        $("#sub_category_select").hide();
        $("#sub_category_input_text").hide();
        $("#date_range").show();
        $("[name=from_date]").val("");
        $("[name=to_date]").val("");
        $("[name=from_date]").datepicker('setEndDate', '0d');
        $("[name=to_date]").datepicker('setEndDate', '0d');
       }

      if(inside_conditions){
        $("#search_result").empty();
      }
    }
  },
  search: function(){
    var category = $("#category").val();

    if(category === "payment_due_report"){
			SEARCH.getDueReport(category);
		} else if(category === "date_of_payment"){
			SEARCH.getPaymentReport(category);
		} else {
      SEARCH.generalSearch(category);
    }
  },
  getPaymentReport: function(category){
      var from_date = $("[name=from_date]").val();
      var to_date = $("[name=to_date]").val();
      var url = CONSTANTS.API_PATH + "payment/paymentDateWise";
      var data = {
        category: category,
        from_date: from_date,
        to_date: to_date
      };
      $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify(data),
        dataType: "json",
        success: function(data, statusTxt){
          console.log(data, statusTxt);
          if(data.output.success === 1){
            var membersArr = data.output.member_data;
            console.log(membersArr);
            if(membersArr){
              var tableEl = "<table border='2'>"
              +"<thead>"
              +"<tr><th>Sl No</th><th>User ID</th><th>Name</th><th>Bhakti Vriksh</th><th>Date of Payment</th><th>Paid for Months</th>"
              +"<th>Amt Paid</th><th>Payment Details</th><th>Payment Remarks</th></tr></thead><tbody>";

              var userCount = 0;
              var userRowSpanArr = [];
              var userIdRowSpan = 0;
              var prevUserId = "";
              var newUserId = "";
              var prevPaymentDate = "";
              var newPaymentDate = "";
              for (var i = 0; i < membersArr.length; i++) {
                userIdRowSpan = 0;
                var member = membersArr[i];
                var id = member["user_id"];
                newUserId = id;
                var name = member["title"]+" "+member["first_name"]+" "+member["last_name"];
                var connected_to = member["connected_to"];
                var payments = member.payments;

                //Add new row for user
                ++userCount;
                tableEl += "<tr class='userrow'><td>"+(userCount)+"</td>";
                tableEl += "<td><a class='user_id' target='_blank' href='member.html'>"+newUserId+"</a></td>";
                tableEl += "<td>"+name+"</td>";
                tableEl += "<td>"+connected_to+"</td>";

                var new_payment_first_time = true;

                for (var j = 0; j < payments.length; j++) {
                  var payment = payments[j];
                  newPaymentDate = payment["payment_date"];
                  var paymentDateRowSpan = payment.paid_for_months.length;
                  userIdRowSpan += paymentDateRowSpan;

                  if(new_payment_first_time){
                    //To Prev Row: Add newPaymentDate only if it is new
                    tableEl += "<td rowspan="+ paymentDateRowSpan +">"+ newPaymentDate +"</td>";
                    new_payment_first_time = false;
                  } else {
                    //To New Row: Add newPaymentDate only if it is new
                    tableEl += "<tr><td rowspan="+ paymentDateRowSpan +">"+ newPaymentDate +"</td>";
                  }

                  var paid_month_first_time = true;

                  for (paid_month_data of payment["paid_for_months"]) {
                      if(paid_month_first_time){
                        //To Prev Row: Add each of the paid_month_data attributes, e.g., month, amount, details and remarks
                        tableEl += "<td>"+paid_month_data['month']+"</td>";
                        tableEl += "<td>"+paid_month_data['amt_paid']+"</td>";
                        tableEl += "<td>"+paid_month_data['payment_details']+"</td>";
                        tableEl += "<td>"+paid_month_data['payment_remarks']+"</td></tr>";
                        paid_month_first_time = false;
                      } else {
                        //To New Row: Add each of the paid_month_data attributes, e.g., month, amount, details and remarks
                        tableEl += "<tr><td>"+paid_month_data['month']+"</td>";
                        tableEl += "<td>"+paid_month_data['amt_paid']+"</td>";
                        tableEl += "<td>"+paid_month_data['payment_details']+"</td>";
                        tableEl += "<td>"+paid_month_data['payment_remarks']+"</td></tr>";
                      }
                  }
                  prevPaymentDate = newPaymentDate;
                }
                userRowSpanArr.push(userIdRowSpan);
                prevUserId = newUserId;
              }
              tableEl += "</tbody></table>";

              $("#search_result").html(tableEl);

              $("#search_result tbody tr.userrow").each(function(idx, item){
                $(item).find("td:lt(4)").attr("rowspan", userRowSpanArr[idx]);
              });

              SEARCH.bindEvents();
            }
          } else if (data.output.success === 0) {
            if(data.output.msg === "API issue"){
              COMMON.showModal("myModal", "Sorry", data.output.msg + ", Code: " + data.output.code);
            } else {
              COMMON.showModal("myModal", "Sorry", data.output.msg);
            }
          }
        },
        error: function(xhr, status){
          console.log(xhr, status);
          COMMON.logoutRedirect(xhr);
        }
      });

  },
  getDueReport: function(category){
    var from_date = $("[name=from_date]").val();
    var to_date = $("[name=to_date]").val();
    var url = CONSTANTS.API_PATH + "member/dueReport";
    var data = {
      category: category,
      from_date: from_date,
      to_date: to_date
    };
    var from_dateRange = COMMON.createDateFromString(from_date);
    $.ajax({
      url: url,
      type: "POST",
      data: JSON.stringify(data),
      dataType: "json",
      success: function(data, statusTxt){
        console.log(data, statusTxt);
        if(data.output.success === 1){
          var membersArr = data.output.member_data;
          var monthArr = data.output.date_range;
          if(membersArr){
            var tableEl = "<table border='2'>"
            +"<thead>"
            +"<th>Sl No</th><th>User ID</th><th>Name</th>";

            for (var i = 0; i < monthArr.length; i++) {
              var month = monthArr[i];
              tableEl += "<th>" + month + "</th>";
            }

            tableEl += "<th>Total Paid</th>";

            tableEl += "</thead><tbody>";

            for (var i = 0; i < membersArr.length; i++) {
              var member = membersArr[i];
              var amt_paid = member["amt_paid"];
              var member_total_amt = 0;
              var mem_start_date_Arr = member["start_date"].split("/");
              var member_start_month_dt = COMMON.createDateFromString("01/"+mem_start_date_Arr[1]+"/"+mem_start_date_Arr[2]);
              tableEl += "<tr><td>"+(i+1)+"</td><td><a href='member.html' class='user_id' target='_blank'>"+member["user_id"]+"</a></td>";
              tableEl += "<td>"+member["title"]+" "+member["first_name"]+" "+member["last_name"]+"</td>";
              var payment_done_months = member.payment_done_months;
              for (var j = 0; j < monthArr.length; j++) {
                var month = monthArr[j];
                var monthSplitArr = month.split(",");
                var monthStr = "01/"+(CONSTANTS.MONTHS_VAL.indexOf(monthSplitArr[0].trim())+1)+"/"+monthSplitArr[1].trim();
                var month_start_dt = COMMON.createDateFromString(monthStr);
                if(month_start_dt<member_start_month_dt){
                  tableEl += "<td style='color: black; font-weight: bold;'>NA</td>";
                }else{
                  if(payment_done_months.indexOf(month) > -1){
                    member_total_amt += parseInt(amt_paid);
                    tableEl += "<td style='color: green; font-weight: bold;'>"+amt_paid+"</td>";
                  } else {
                    tableEl += "<td style='color: red; font-weight: bold;'>0</td>";
                  }
                }

              }

              tableEl += "<td>"+member_total_amt+"</td>"

              tableEl += "</tr>";
            }

            tableEl += "</tbody></table>";
            $("#search_result").html(tableEl);
            SEARCH.bindEvents();
          }
        } else if (data.output.success === 0) {
          if(data.output.msg === "API issue"){
            COMMON.showModal("myModal", "Sorry", data.output.msg + ", Code: " + data.output.code);
          } else {
            COMMON.showModal("myModal", "Sorry", data.output.msg);
          }
        }
      },
      error: function(xhr, status){
        console.log(xhr, status);
        COMMON.logoutRedirect(xhr);
      }
    });
  },
  generalSearch: function(category){
    var sub_cat_type = $("#category").find("option:selected").data("subtype");
    var sub_category = sub_cat_type === "select" ? $("#sub_category_select").val() : $("#sub_category_input_text").val();
    var url = CONSTANTS.API_PATH + "member/categorySearch";
    var data = {
      category: category,
      sub_category: sub_category
    };
    // if(category === "all_members"){
    //   url = CONSTANTS.API_PATH + "member/list";
    // }
    $.ajax({
      url: url,
      type: "POST",
      data: JSON.stringify(data),
      dataType: "json",
      success: function(data, statusTxt){
        console.log(data, statusTxt);
        if(data.output.success === 1){
          var membersArr = data.output.members;
          if(membersArr){
            var tableEl = "<table border='2'>"
            +"<thead>"
            +"<th>Sl No</th><th>User ID</th><th>Name</th><th>Phone Number</th>"
            +"<th>Email</th><th>Corresponder Name</th><th>Connected To</th>"
            +"<th>Scheme</th><th>Member Since</th><th>BTG Lang Pref</th>"
            +"<th>Last Payment</th><th>Last Followup</th><th>Last BTG Sent</th>"
            +"<th>Last Gift Sent</th><th>Last Prasadam Sent</th>"
            +"</thead>"
            +"<tbody>";

            for (var i = 0; i < membersArr.length; i++) {
              var memberData = membersArr[i];
              tableEl += "<tr>";
              tableEl += "<td>"+(i+1)+"</td>";
              tableEl += "<td><a href='member.html' class='user_id' target='_blank'>"+memberData['user_id']+"</a></td>";
              tableEl += "<td>"+memberData['title']+" "+memberData['first_name']+" "+memberData["last_name"]+"</td>";
              tableEl += "<td>"+memberData['phone_no']+"</td>";
              tableEl += "<td>"+memberData['email_id']+"</td>";
              tableEl += "<td>"+memberData['corresponder']+"</td>";
              tableEl += "<td>"+memberData['connected_to']+"</td>";
              tableEl += "<td>"+memberData['scheme_name']+"</td>";
              tableEl += "<td>"+memberData['start_date']+"</td>";
              tableEl += "<td>"+memberData['user_lang']+"</td>";
              tableEl += "<td>"+memberData['last_payment_date']+"</td>";
              tableEl += "<td>"+memberData['last_followup_date']+"</td>";
              tableEl += "<td>"+memberData['last_btg_sent_date']+"</td>";
              tableEl += "<td>"+memberData['last_gift_sent_date']+"</td>";
              tableEl += "<td>"+memberData['last_prasadam_sent_date']+"</td>";
              tableEl += "</tr>";
            }

            tableEl += "</tbody></table>";

            $("#search_result").html(tableEl);
            SEARCH.bindEvents();
          } else {
            $("#search_result").empty();
            COMMON.showModal("myModal", "Sorry", "No member found for given criteria");
          }
        } else if (data.output.success === 0) {
          $("#search_result").empty();
          if(data.output.msg === "API issue"){
            COMMON.showModal("myModal", "Sorry", data.output.msg + ", Code: " + data.output.code);
          } else {
            COMMON.showModal("myModal", "Sorry", data.output.msg);
          }
        }
      },
      error: function(xhr, status){
        console.log(xhr, status);
        COMMON.logoutRedirect(xhr);
      }
    });
  }
};
