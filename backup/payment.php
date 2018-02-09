<?php
require 'dbConnect.php';
session_start(); //starts the session
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
<!--        <link rel="stylesheet" href="lib/bootstrap.min.css">-->
<!--        <script src="lib/jquery.min.js"></script>-->
<!--        <script src="lib/bootstrap.min.js"></script>-->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
        <!-- Bootstrap Date-Picker Plugin -->
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.4.1/js/bootstrap-datepicker.min.js"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.4.1/css/bootstrap-datepicker3.css"/>
        <link rel="stylesheet" href="css/payment.css">
        <title>Payment Info Page</title>
    </head>
    <?php
        function month_diff($start_date, $current_date)
        {
            $begin = new DateTime( $start_date );
            $end = new DateTime( $current_date );
            $end = $end->modify( '+1 month' );

            $interval = DateInterval::createFromDateString('1 month');

            $period = new DatePeriod($begin, $interval, $end);
            $counter = 0;
            foreach($period as $dt) {
                $counter++;
            }

            return $counter;
        }
        $current_date = date("d/m/Y");
        $current_year = date('Y');
        $current_month = date('F');

//        $current_date = "2018-09-26";
//        $start_date = "2018-01-26";
//        $current_year = "2018";
//        $current_month = "September";
        $user_id = $_SESSION['$user_id'];
        $first_time_payment = $_SESSION['$first_time_payment'];
//        echo ($user_id);

    //FETCH FIRST NAME AND LAST NAME OF USER AND start date
        $fetch_user_info_query = mysqli_query($con,"SELECT title,first_name,last_name,start_date FROM Users WHERE user_id='$user_id';");
        $fetched_row = mysqli_fetch_row($fetch_user_info_query);
        $title = $fetched_row[0];
        $first_name = $fetched_row[1];
        $last_name = $fetched_row[2];
        $start_date = $fetched_row[3];
        $total_mnths = month_diff($start_date,$current_date);
//    echo "start_date: " ."$start_date";
//    echo "current month:  " ."$current_month";
    echo "total months:" ."$total_mnths";
    // FETCH SCHEME_ID AND DURATION
        $fetch_schemeId_query = mysqli_query($con,"SELECT scheme_id FROM User_Donation WHERE user_id='$user_id';");
        $fetched_schemIdrow = mysqli_fetch_row($fetch_schemeId_query);
        $scheme_id = $fetched_schemIdrow[0];
    //FETCH SCHEME INFO
        $fetch_schemeInfo_query = mysqli_query($con,"SELECT scheme_name,scheme_value FROM Scheme WHERE scheme_id='$scheme_id';");
        $fetched_schemeRow = mysqli_fetch_row($fetch_schemeInfo_query);
        $scheme_name = $fetched_schemeRow[0];
        $scheme_value = $fetched_schemeRow[1];
    //FETCH DUE INFO
        $net_amt_paid = 0;
        if($first_time_payment =="Y")
        {
            $net_amt_paid = 0;
            $total_amt_tobepaid = $scheme_value;
        }else
        {
            $fetch_amtpaid_query = mysqli_query($con,"SELECT amt_paid FROM User_Payment WHERE user_id='$user_id';");
            while($fetched_amtRow = mysqli_fetch_array($fetch_amtpaid_query))
            {
                $net_amt_paid = $net_amt_paid + $fetched_amtRow[0];
            }
//            echo " NET AMT PAID: " ."$net_amt_paid";
            $total_amt_tobepaid = $total_mnths * $scheme_value ;
        }
        $due_amt = $total_amt_tobepaid - $net_amt_paid;
//    echo "  TOTAL DUE: " ."$total_amt_tobepaid";
//    echo "  REMAINING DUE: " ."$due_amt";
    ?>
    <body>
        <a href="searchUser.php"><span class="glyphicon glyphicon-home"></span></a><br/><br/>
        <h2>Payment Info</h2>
        <?php require 'logout_modal.php';
        ?>
        <form action="payment.php" method="POST">
           <div class="container-fluid">
               <div class="row">
                   <div class="col-md-2">Title:</div>
                   <div class="col-md-2"><input type="text" name="first_name" disabled value="<?=$title?>"/></div>
                   <div class="col-md-2">First Name:</div>
                   <div class="col-md-2"><input type="text" name="first_name" disabled value="<?=$first_name?>"/></div>
                   <div class="col-md-2">Last Name:</div>
                   <div class="col-md-2"><input type="text" name="last_name" disabled value="<?=$last_name?>"/></div>
               </div>
               <div class="row">
                   <div class="col-md-2">Donation Category Name:</div>
                   <div class="col-md-2"><input type="text" name="scheme_name" value="<?=$scheme_name?>"disabled/></div>
                   <div class="col-md-2">Donation Value in INR:</div>
                   <div class="col-md-2"><input type="text" name="scheme_value" value="<?=$scheme_value?>" disabled/></div>
                   <div class="form-group">
                       <div class="col-md-2"><label for="sel1_pt">Payment Type:</label></div>
                       <div class="col-md-2"><select class="form-control" id="sel1_pt"  name="payment_type" width="10%">
                        <option>Cash</option>
                        <option>Cheque</option>
                        <option>Card</option>
                        <option>Online payment</option>
                        </select>
                        </div>
                   </div>
               </div>
               <div class="row">
                   <div class="col-md-2">Reference No.: </div>
                   <div class="col-md-2"><input type="text" name="payment_details" required="required" /></div>
                   <div class="col-md-2">Amount Paid:</div>
                   <div class="col-md-2"><input type="text" name="amt_paid" required="required" /></div>   <div class="col-md-2">Total Due:</div>
                   <div class="col-md-2"><input type="text" name="due_amt" value="<?=$due_amt?>" disabled/></div>
               </div>
               <div class="row">
                   <div class="col-md-2"><label class="control-label" for="date">Date of Payment:</label></div>
                   <div class="col-md-2"><input id="date" name="payment_date" required="required" placeholder="DD/MM/YYYY" type="text"/></div>
<!--               </div>-->
               <script>
                    $(document).ready(function(){
                      var date_input=$('input[name="payment_date"]'); //our date input has the name "payment_date"
                      var container=$('.bootstrap-iso form').length>0 ? $('.bootstrap-iso form').parent() : "body";
                      var options={
                        format: 'dd/mm/yyyy',
                        container: container,
                        todayHighlight: true,
                        autoclose: true,
                        orientation: 'auto top'
                      };
                      date_input.datepicker(options);
                    })
                </script>
               <div class="col-md-2">Remarks:</div>
               <div class="col-md-2"><input type="text" name="payment_remarks" required="required" /></div>
               </div>
            </div>
           <input type="submit" id="addpayment" value="Add Entry"/>
        </form>
    </body>
</html>
<?php
//session_start();
//$user_id = $_SESSION['$user_id'];
//echo ($user_id);
if($_SERVER["REQUEST_METHOD"] == "POST")
{
    $payment_type = mysqli_real_escape_string($con,$_POST['payment_type']);
    $payment_details = mysqli_real_escape_string($con,$_POST['payment_details']);
    $amt_paid = mysqli_real_escape_string($con,$_POST['amt_paid']);
//    $due_amt = mysqli_real_escape_string($con,$_POST['due_amt']);
    $payment_date = mysqli_real_escape_string($con,$_POST['payment_date']);
    $payment_remarks = mysqli_real_escape_string($con,$_POST['payment_remarks']);
    $bool = true;

//    $con=mysqli_connect("localhost","root","","Admin_db");
//
//    // Check connection
//    if (mysqli_connect_errno()) {
//      echo "Failed to connect to MySQL: " . mysqli_connect_error();
//    }
//    mysql_connect("localhost", "root","") or die(mysql_error());
//    mysql_select_db("Admin_db") or die("Cannot connect to database");
    $query = mysqli_query($con,"Select * from User_Payment"); // CHECK TO BE ADDED
    if($bool)
    {
        $dateTime = date_create_from_format('d/m/Y',$payment_date);
        $formatted_date = date_format($dateTime, 'Y-m-d');
        $mnth_qry = mysqli_query($con,"SELECT MONTHNAME('$formatted_date')");
        $mnth = mysqli_fetch_row($mnth_qry);
    //echo "$mnth[0]"; //month of payment
        $month_of_pmt = $mnth[0];
        if($amt_paid==$due_amt)
        {
            $is_due = "N";
        }
        else{
            $is_due = "Y";
        }
        if($month_of_pmt == $current_month){
            $cp = "Y"; //current monthly payment flag is set to "Y"
        }else{
           if($month_of_pmt != $current_month){
                $cp = "N"; //current monthly payment flag is set to "N"
            }
        }
//        echo "  MONTH OF PAYMENT:  "."$month_of_pmt";
//        echo "  CURRENT MONTH:  "."$current_month";
//        echo "  IS due??:  "."$is_due";
//        echo "  cp:  "."$cp";
        $insert_query = "INSERT INTO User_Payment(user_id,payment_type,payment_date,amt_paid,payment_details,payment_remarks) VALUES('$user_id','$payment_type','$formatted_date','$amt_paid','$payment_details','$payment_remarks');";
        mysqli_query($con,$insert_query);
        $sel_query =mysqli_query($con,"SELECT * FROM User_Due WHERE user_id='$user_id';");
        $count_rows = mysqli_num_rows($sel_query);
//        echo($count_rows);
        if($count_rows>0)
        {
           $query_due ="UPDATE User_Due SET is_due='$is_due',cp='$cp' WHERE user_id='$user_id';";
        }
        else{
           $query_due ="INSERT INTO User_Due(user_id,is_due,cp) VALUES('$user_id','$is_due','$cp');";
        }
//        echo "$query_due";
        mysqli_query($con,$query_due);
//        echo($is_due);

//        Print '<script>alert("Payment Details taken successfully!");</script>';
        mysqli_close($con);
        $_SESSION['$user_id'] = "";
//        session_destroy();
        Print '<script>window.location.assign("searchUser.php");</script>';
    }

}
?>