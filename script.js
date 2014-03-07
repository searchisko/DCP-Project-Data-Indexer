/*
 * JBoss, Home of Professional Open Source
 * Copyright 2014 Red Hat Inc. and/or its affiliates and other contributors
 * as indicated by the @authors tag. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview
 * Data pump to pull data from Magnolia projectData REST end point
 * and push into appropriate DCP REST end point.
 *
 * @author Lukas Vlcek (lvlcek@redhat.com)
 */

var messageCodes = {
	INFO : "class='info'",
	DEBUG : "class='debug'",
	ERROR : "class='error'"
}

var logMessage = function(message, opt_code) {
	var code = opt_code || messageCodes.INFO;
	$("#log").append("<li "+code+">"+message+"</li>");
}

/**
 * @private
 */
var xsableInputElements_ = function(boolean) {
	$.each(["#source_url", "#target_url", "#startButton"], function(i, element){
		$(element).attr('disabled', boolean)
	});
}

/**
 * Disable input elements.
 */
var disableInputElements = function() {
	xsableInputElements_(true);
}

/**
 * Enable input elements.
 */
var enableInputElements = function() {
	xsableInputElements_(false);
}

/**
 * Reset progress bar and set new max value.  Defaults to 100.
 * @param {number=} opt_max
 */
var resetProgressBar = function(opt_max) {
	var max = opt_max || 100;
	var progressBar = $("#progressBar");
	progressBar.attr('max',max);
	progressBar.attr('value',0);
}

/**
 * Update progress bar to given value.
 * @param {number}
 */
var setProgressBar = function(value) {
	var progressBar = $("#progressBar");
	progressBar.attr('value',value);
}

/**
 * @return {number}
 */
var getProgressBarValue = function() {
	var value = $("#progressBar").attr('value');
	return +value; // force number type
}

/**
 * Indeterminate progress bar.
 */
var indeterminateProgressBar = function() {
	var progressBar = $("#progressBar");
	progressBar.attr('max',null);
	progressBar.attr('value',null);
}

var processData = function(data) {

	if (data && data.hits && data.hits.hits) {
		var hits = data.hits.hits;
		if (hits.length && hits.length > 0) {
			
			var target_url = $("#target_url").val();
			var totalHits = hits.length;
			logMessage("Sending out " + totalHits + " requests...");
			resetProgressBar(totalHits);

			// prepare XHR config
			var ajaxconf = {
				type: 'POST',
				//url: na,
				crossDomain: true,
				data: JSON.stringify(data),
				dataType: 'JSON',
				processData: false,
				contentType: 'application/json'
				// ,async:false
			};

			// setup credentials if provided
			var username = $.trim($("#username").val());
			var password = $.trim($("#password").val());
			if (username.length > 0 && password.length > 0) {
				ajaxconf["username"] = username;
				ajaxconf["password"] = password;
				ajaxconf["xhrFields"] = { withCredentials: true	};
			}

			// create deferred chain
			var dfr = $.Deferred();

			$.each(hits, function(i, hit){

				var data = hit._source;
				ajaxconf["url"] = target_url+"/content/"+data.sys_content_type+"/"+data.sys_content_id;

				dfr.then(
					$.ajax(
						ajaxconf
					).done(function(){
						logMessage("[OK] hit ["+(i+1)+"] for ["+data.sys_content_id+"]");
					}).fail(function(){
						logMessage("[ERROR] hit ["+(i+1)+"] for ["+data.sys_content_id+"]", messageCodes.ERROR);
					}).always(function(){
						setProgressBar(getProgressBarValue()+1);
					})
				);
			});
		}
		dfr.then(function(){
			logMessage("Done.");
			resetProgressBar();
			enableInputElements();
		});
		dfr.resolve();
	} else {
		logMessage("Malformed data!");
		resetProgressBar();
		enableInputElements();
	}
}

/**
 * Click handler that is bind to a start button.
 */
var startButtonClicked = function() {
	
	$("#log").empty();
	indeterminateProgressBar();

	var source_url = $("#source_url").val();
	logMessage("Getting source data from " +source_url);

	disableInputElements();

	$.ajax({
	  dataType: "json",
	  url: source_url
	}).fail(function(err){
		logMessage("Got error" + err);
	  	resetProgressBar();
	}).done(function(data){
		logMessage("Got source data.");
		processData(data);
	});
}

var start = function(jQuery) {
	var startButton = $("#startButton");
	startButton.bind("click", startButtonClicked);
}

// Standard jQuery pattern that kickstarts on page ready.
$(document).ready(start);
