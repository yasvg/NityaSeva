<?php
require_once("../common/dbcontroller.php");
/*
A domain Class to demonstrate RESTful web services
*/
Class GiftPrasadam {
	private $btgs = array();
	public function getAllGiftPrasadam(){
		if(isset($_GET['user_id']) && isset($_GET['type'])){
			$user_id = $_GET['user_id'];
			$type = $_GET['type'];
			$query = 'SELECT * FROM User_Gift_Prasadam WHERE user_id=' .$user_id. ' and type="'.$type. '" ORDER BY dispatch_date DESC';
		} else if(isset($_GET['type'])){
			$type = $_GET['type'];
			$query = 'SELECT * FROM User_Gift_Prasadam WHERE type="'.$type. '" ORDER BY dispatch_date DESC';
		} else {
			$query = 'SELECT * FROM User_Gift_Prasadam ORDER BY dispatch_date DESC';
		}
		$dbcontroller = new DBController();
		$this->btgs = $dbcontroller->executeSelectQuery($query);
		return $this->btgs;
	}

	public function addGiftPrasadam(){
		$data = json_decode(file_get_contents('php://input'), true);
		$result = array('success'=>0, "msg"=>"API issue", "code"=>'901');
		// print_r($data);
		if(isset($data['payment_scheme_name']) && isset($data['payment_scheme_value']) && isset($_SESSION['selected_member_id'])){
			$dbcontroller = new DBController();
			$con = $dbcontroller->connectDB();

			$payment_type = mysqli_real_escape_string($con,$data['payment_type']);
	    $payment_details = mysqli_real_escape_string($con,$data['payment_details']);
	    $amt_paid = mysqli_real_escape_string($con,$data['amt_paid']);
	    $payment_date = mysqli_real_escape_string($con,$data['payment_date']);
	    $payment_remarks = mysqli_real_escape_string($con,$data['payment_remarks']);
			$scheme_name = mysqli_real_escape_string($con,$data['payment_scheme_name']);;
			$scheme_value = mysqli_real_escape_string($con,$data['payment_scheme_value']);;
			$member_id = mysqli_real_escape_string($con,$data['payment_scheme_value']);;

			$dateTime = date_create_from_format('d/m/Y',$start_date);
			$formatted_date = date_format($dateTime, 'Y-m-d');

			// $query = mysqli_query($con,"Select * from Users");
	    // $query2 = mysqli_query($con,"Select * from User_Donation");

			$user_already_ex_q = "SELECT user_id,title,first_name,last_name,address,phone_no,whatsapp,email_id,start_date,is_active,connected_to,user_lang,scheme_id,scheme_name,corresponder,remarks FROM Users WHERE phone_no = '$phone_no';";

			$searchSchemeId_query = "SELECT scheme_id,scheme_value FROM Scheme WHERE scheme_name = '$scheme_name';";

			//check if phone no already exists
			$alreadyExistingUserRes = $dbcontroller->executeSelectQuery($user_already_ex_q);
			if(count($alreadyExistingUserRes) > 0){
				//If yes then send already existing message
				$result = array('success'=>0, "msg"=>"Phone number already taken", "code"=>'902');
			} else {
				//If No, check scheme table if scheme exists
				$schemeQueryRes = $dbcontroller->executeSelectQuery($searchSchemeId_query);
				if(count($schemeQueryRes) > 0){
					$scheme_data = $schemeQueryRes[0];
					$scheme_id = $scheme_data["scheme_id"];
					$scheme_value = $scheme_data["scheme_value"];

					$insert_user_query = "INSERT INTO Users(title,first_name,last_name,address,phone_no,whatsapp,email_id,start_date,is_active,connected_to,user_lang,scheme_id,scheme_name,corresponder,remarks) VALUES('$title','$first_name','$last_name','$address','$phone_no','$whatsapp','$email_id','$formatted_date','$is_active','$connected_to','$user_lang','$scheme_id','$scheme_name','$corresponder','$remarks');";

					//insert user into Users table
					$insertUserResult = $dbcontroller->executeQuery($insert_user_query);
					if($insertUserResult > 0){
						$newUserRes = $dbcontroller->executeSelectQuery($user_already_ex_q);
						if(count($newUserRes) > 0){
							$userData = $newUserRes[0];
							$user_id = $userData['user_id'];

							$insert_ud_query = "INSERT INTO User_Donation(user_id,scheme_id,scheme_name,payment_type,corresponder,remarks) VALUES('$user_id','$scheme_id','$scheme_name','$payment_type','$corresponder','$remarks');";

							$insertUserDonationRes = $dbcontroller->executeQuery($insert_ud_query);

							// if($insertUserDonationRes > 0){
								// $userData['scheme_id'] = $scheme_id;
								// $userData['scheme_name'] = $scheme_name;
								// $userData['scheme_value'] = $scheme_value;
								$result = array('success'=>1, 'msg'=>'Member added successfully', "code"=>'200', 'userData'=>$userData);
							// } else {
							// 	$result = array('success'=>0, "msg"=>"API issue", "code"=>'904');
							// }
						}
					} else {
						$result = array('success'=>0, "msg"=>"API issue", "code"=>'905');
					}
				} else {
					$result = array('success'=>0, "msg"=>"API issue", "code"=>'904');
				}
			}
		} else {
			$result = array('success'=>0, "msg"=>"API issue", "code"=>'903');
		}

		return $result;
	}

	public function deleteGiftPrasadam(){
		if(isset($_GET['id'])){
			$id = $_GET['id'];
			$query = 'DELETE FROM tbl_mobile WHERE id = '.$id;
			$dbcontroller = new DBController();
			$result = $dbcontroller->executeQuery($query);
			if($result != 0){
				$result = array('success'=>1);
				return $result;
			}
		}
	}

	public function editGiftPrasadam(){
		if(isset($_POST['name']) && isset($_GET['id'])){
			$name = $_POST['name'];
			$model = $_POST['model'];
			$color = $_POST['color'];
			$query = "UPDATE tbl_mobile SET name = '".$name."',model ='". $model ."',color = '". $color ."' WHERE id = ".$_GET['id'];
		}
		$dbcontroller = new DBController();
		$result= $dbcontroller->executeQuery($query);
		if($result != 0){
			$result = array('success'=>1);
			return $result;
		}
	}

}
?>
