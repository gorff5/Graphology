<?php
/**
 * Created by PhpStorm.
 * User: Asafy
 * Date: 11/02/2017
 * Time: 17:14
 */

addToCsvFile();
//sendForm();

function sendForm()
{
    require_once 'app/Mandrill.php';
//    $mandrill = new Mandrill('api');

    $message = new stdClass();
    $message->html = "html message";
    $message->text = "text body";
    $message->subject = "email subject";
    $message->from_email = "address@test.com";
    $message->from_name = "From Name";
    $message->to = array(array("email" => "gorff5@gmail.com"));
    $message->track_opens = true;

    $response = $mandrill->messages->send($message);
    echo $response;
}

function addToCsvFile()
{
    $fp = fopen("leads.csv", 'a');  //Open file for append
    fwrite($fp,$_REQUEST); //Append row,row to file
    fputcsv($fp, $_REQUEST); //@Optimist
    fclose($fp); //Close the file to free memory.

}
