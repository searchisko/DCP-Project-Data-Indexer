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
 * @author lvlcek@redhat.com (Lukas Vlcek)
 */

$(document).ready(function(){

	var messageCodes = {
		INFO : "class='info'",
		DEBUG : "class='debug'",
		ERROR : "class='error'"
	};

	var log = $("#log");
	var startButton = $("#startButton");
	startButton.bind("click", startButtonClicked);

	/**
	 * Click handler that is bind to a start button.
	 */
	function startButtonClicked() {
		log.empty();
		indeterminateProgressBar();

		var source_url = $("#source_url").val();
		logMessage("Getting source data from " +source_url);

		disableInputElements();

		$.ajax({
			dataType: "json",
			url: source_url
		}).fail(function(err){
			logMessage("Got error: " + err);
			resetProgressBar();
		}).done(function(data){
			logMessage("Got source data.");
			processData(data);
		});
	}

	function processData(data) {
		if (data && data.hits && data.hits.hits) {

			var hits = data.hits.hits;
			var dfr = $.Deferred();

			if (hits.length && hits.length > 0) {

				var target_url = $("#target_url").val();
				var totalHits = hits.length;
				logMessage("Sending out " + totalHits + " requests...");
				resetProgressBar(totalHits);

				// prepare common XHR config
				var ajaxconf = {
					type: 'POST',
					crossDomain: true,
					dataType: 'JSON',
					processData: false,
					contentType: 'application/json'
					// ,async:false
				};

				// setup credentials if provided
				var username = $.trim($("#username").val());
				var password = $.trim($("#password").val());
				if (username.length > 0 && password.length > 0) {
//					ajaxconf.headers = { Authorization: 'Basic ' + btoa(username + ':' + password) };
					ajaxconf.xhrFields = { withCredentials: true };
				}

				$.each(hits, function(i, hit){

					var conf = {};
					$.extend(true, conf, ajaxconf);

					var data = hit._source;
					conf["data"] = JSON.stringify(data);
					conf["url"] = target_url+"/content/"+data.sys_content_type+"/"+data.sys_content_id;

					dfr.then(
						function() {
							return $.ajax(conf)
								.done( function() { logMessage("[OK] hit ["+(i+1)+"] for ["+data.sys_content_id+"]"); } )
								.fail( function() { logMessage("[ERROR] hit ["+(i+1)+"] for ["+data.sys_content_id+"]", messageCodes.ERROR); } )
								.always( function() { setProgressBar(getProgressBarValue()+1); } );
						}
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
	 * Indeterminate progress bar.
	 */
	function indeterminateProgressBar() {
		var progressBar = $("#progressBar");
		progressBar.attr('max',null);
		progressBar.attr('value',null);
	}

	/**
	 * @return {number}
	 */
	function getProgressBarValue() {
		var value = $("#progressBar").attr('value');
		return +value; // force number type
	}

	/**
	 * Update progress bar to given value.
	 * @param {number} value
	 */
	function setProgressBar(value) {
		var progressBar = $("#progressBar");
		progressBar.attr('value',value);
	}

	/**
	 * Disable input elements.
	 */
	function disableInputElements() {
		xsableInputElements_(true);
	}

	/**
	 * Enable input elements.
	 */
	function enableInputElements() {
		xsableInputElements_(false);
	}

	/**
	 * Reset progress bar and set new max value.  Defaults to 100.
	 * @param {number=} opt_max
	 */
	function resetProgressBar(opt_max) {
		var max = opt_max || 100;
		var progressBar = $("#progressBar");
		progressBar.attr('max',max);
		progressBar.attr('value',0);
	}

	function logMessage(message, opt_code) {
		var code = opt_code || messageCodes.INFO;
		log.append("<li "+code+">"+message+"</li>");
	}

	/**
	 * @private
	 */
	function xsableInputElements_(boolean) {
		$.each(["#source_url", "#target_url", "#startButton"], function(i, element){
			$(element).attr('disabled', boolean)
		});
	}

});
