var ADMIN = {
  init: function () {
    var adminId = sessionStorage.getItem("admin_id");
    if(adminId){
      $.ajax({
          url: CONSTANTS.API_PATH + "admin/list/" + adminId,
          // url: apiPath + "member-api/RestController.php?page_key=create",
          method: "GET",
          // data: JSON.stringify(data),
          dataType: "json",
          success: function(data, statusTxt){
              console.log(data, statusTxt);
              if(data.output.length > 0){
                var userData = data.output[0];
                // COMMON.disableInnerEls("section:eq(0)");

                // var userActive = userData['is_active'];

                //Fill Various Field Values
                $("[name=title]").val(userData['title']);
                $("[name=first_name]").val(userData['first_name']);
                $("[name=last_name]").val(userData['last_name']);
                $("[name=phone_no]").val(userData['phone_no']);
                $("[name=email_id]").val(userData['email_id']);
                $("[name=start_date]").val(userData['start_date']);
                $("[name=username]").val(userData['username']);
                $("[name=password]").val(userData['pwd']);

                // $("section:gt(0)").show();
              } else {
                COMMON.showModal("myModal", "Sorry", "No admin found for admin id: " + adminId);
              }
          },
          error: function(xhr, status){
              console.log(xhr, status);
          }
      });
    } else {
      // $("section:gt(0)").hide();
      // $("section#member-section").show();
    }
  },
  addAdmin: function () {
    var jsonData = COMMON.createFormDataJson("#add-admin");
    console.log(jsonData);
    $.ajax({
        url: CONSTANTS.API_PATH + "admin/create",
        // url: apiPath + "member-api/RestController.php?page_key=create",
        method: "POST",
        data: JSON.stringify(jsonData),
        // dataType: "json",
        success: function(data, statusTxt){
          console.log(data, statusTxt);
          if(data.success === 1){
            COMMON.showModal("myModal", "Hari Bol!", data.msg, "#add-admin");
          } else if(data.success === 0) {
            if(data.msg === "API issue"){
              COMMON.showModal("myModal", "Sorry", data.msg + ", Code: " + data.code);
            } else {
              COMMON.showModal("myModal", "Sorry", data.msg);
            }
          }
        },
        error: function(xhr, statusTxt){
          console.log(xhr, status);
        }
    });
  },
  showAdminList: function(){
    // var memberId = sessionStorage.getItem('member_id');
    // console.log("CONSTANTS", CONSTANTS);
    var url = CONSTANTS.API_PATH + "admin/list";
    // console.log("url", url);
    $.ajax({
        url: url,
        method: "GET",
        // data: JSON.stringify(data),
        dataType: "json",
        success: function(data, statusTxt){
          console.log(data, statusTxt);
          if(data.output.length > 0){
            var adminList = data.output;
            var tableEl = "<table border='1'><thead><th>Admin ID</th><th>Title</th><th>First Name</th><th>Last Name</th><th>Username</th><th>Phone No</th><th>Email Id</th><th>Start date</th><th>SuperAdmin</th></thead>";
            tableEl += "<tbody>";

            for(var i=0; i<adminList.length; i++){
              var admin_info = adminList[i];
              tableEl += "<tr>";
              tableEl += "<td><a href='addAdmin.html' class='admin_infoid'>"+admin_info['admin_id']+"</a></td>";
              tableEl += "<td>"+admin_info['title']+"</td>";
              tableEl += "<td>"+admin_info['first_name']+"</td>";
              tableEl += "<td>"+admin_info['last_name']+"</td>";
              tableEl += "<td>"+admin_info['username']+"</td>";
              tableEl += "<td>"+admin_info['phone_no']+"</td>";
              tableEl += "<td>"+admin_info['email_id']+"</td>";
              tableEl += "<td>"+admin_info['start_date']+"</td>";
              tableEl += "<td>"+admin_info['is_superAdmin']+"</td>";
              tableEl += "</tr>";
            }

            tableEl += "</tbody></table>";

            $("#adminList").html(tableEl);
          }
        },
        error: function(xhr, statusTxt){
          console.log(xhr, status);
        }
    });
  }
};