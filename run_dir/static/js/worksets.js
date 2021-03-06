/*
File: worksets.js
URL: /static/js/worksets.js
Powers /worksets/[List type] - template is run_dir/design/worksets.html
*/

// Get pseudo-argument for this js file. worksets = 'all'
var worksets_page_type = $('#worksets-js').attr('data-worksets');

$(document).ready(function() {
  
    // Load the data
    load_table();
    // Show the page   
    $('#loading_spinner').hide();
    $('#page_content').show();
  
  // Prevent traditional html submit function
  $('#Search-form').submit(function(event){event.preventDefault();});
  
});

function load_table() {
  // Get the columns and write the table header
  columns = [['Date Run', 'date_run'],['Workset Name', 'workset_name'],['Projects (samples)','projects'], ['Operator', 'technician'], ['Application', 'application'], ['Library','library_method'], ['Samples Passed', 'passed'],['Samples Failed', 'failed'], ['Pending Samples', 'unknown'], ['Total samples', 'total']];
  load_table_head(columns);
  
  // Display the loading spinner in the table
  $("#workset_table_body").html('<tr><td colspan="'+columns.length+'" class="text-muted"><span class="glyphicon glyphicon-refresh glyphicon-spin"></span> <em>Loading..</em></td></tr>');
  
  
  return $.getJSON("/api/v1/worksets?list=" + worksets_page_type, function(data) {
    $("#workset_table_body").empty();
    var size = 0;
    $.each(data, function(workset_name, summary_row) {
      size++;
      var tbl_row = $('<tr>');
      $.each(columns, function(i, column_tuple){
          var content='';
          if (column_tuple[1] == 'projects'){
            $.each(summary_row['projects'], function(project_id, project_data ){
                content+='<a href="/project/' + project_id + '">' + project_id + '</a> (' + project_data['samples_nb'] + ')  ';
            });
          }else if (column_tuple[1] == 'application' || column_tuple[1] == 'library_method'){
              content = summary_row[column_tuple[1]].join(', ');
          }else if (column_tuple[1] == 'passed' || column_tuple[1] == 'failed' || column_tuple[1] == 'unknown' || column_tuple[1] == 'total'){
              content=summary_row['samples'][column_tuple[1]];
          }else if (column_tuple[1] == 'technician'){
              if(summary_row[column_tuple[1]] !== undefined && summary_row[column_tuple[1]].slice(-1) == 'X'){
                  content=summary_row[column_tuple[1]].slice(0,-1);
              }else{
                  content=summary_row[column_tuple[1]];
              }
          }else{
              content=summary_row[column_tuple[1]];
          }
        tbl_row.append($('<td>')
        .addClass(column_tuple[1])
        .html(content)
        );
      });
      
      // Add links to worksets
      tbl_row.find('td.workset_name').html('<a href="/workset/' + workset_name+ '">' + workset_name + '</a>');
      // make projects links
      $("#workset_table_body").append(tbl_row); 
    });
    
    // Initialise the Javascript sorting now that we know the number of rows
    init_listjs(size, columns);
  });
}

function load_table_head(columns){
  var tbl_head = $('<tr>');
  $.each(columns, function(i, column_tuple) {
    tbl_head.append($('<th>')
      .addClass('sort a')
      .attr('data-sort', column_tuple[1])
      .text(column_tuple[0])
    );  
  });
  $("#workset_table_head").html(tbl_head);
}



// Initialize sorting and searching javascript plugin
function init_listjs(no_items, columns) {
  column_names = new Array();
  $.each(columns, function(i, column_tuple){
    column_names.push(column_tuple[1]);
  });
  var options = {
    valueNames: column_names,
    page: no_items /* Default is to show only 200 items at a time. */
  };
  var featureList = new List('page_content', options);
  featureList.search($('#search_field').val());
  featureList.sort('date_run', { order: "desc" })
}


function load_workset_notes(wait) {
  // Clear previously loaded notes, if so
  $("#workset_notes_panels").empty();
  $.getJSON("/api/v1/workset_notes/" + worksets_page_type, function(data) {
    $.each(data, function(date, note) {
        noteText = make_markdown(note['note']);
      $('#workset_notes_panels').append('<div class="panel panel-default">' +
          '<div class="panel-heading">'+
            '<a href="mailto:' + note['email'] + '">'+note['user']+'</a> - '+
            date.toDateString() + ', ' + date.toLocaleTimeString(date)+
          '</div><div class="panel-body">'+noteText+'</div></div>');
    });
  }).fail(function( jqxhr, textStatus, error ) {
      var err = textStatus + ", " + error;
      console.log( "Workset notes request failed: " + err );
  });
}
//Check or uncheck all fields from clicked category
/* Currently commented,  for the time where there will be a lot of columns
 * to filter 

function choose_column(col){
  var column = document.getElementById(col);
  //Get all the children (checkboxes)
  var cbs = column.getElementsByTagName('input');
  //If one of them is checked we uncheck it, if none of them are checked, 
  //we check them all
  var checked = false;
  for (var i = 0; i < cbs.length; i++) {
    if (cbs[i].checked) {
      cbs[i].checked = false;
      checked = true;
    }
  }
  if (!checked) {
    for (var i = 0; i < cbs.length; i++) {
      cbs[i].checked = true;
    }
  }
}

// Column filtering clicks 
$('body').on('click', '.search-action', function(event) {
  event.preventDefault();
  switch ($(this).data('action')) {
    case 'filterReset':
      reset_default_checkboxes(true);
    case 'filterApply':
      load_table();
      break;
    case 'filterHeader':
      choose_column($(this).parent().attr("id"));
      break;
      break;
  }
});


function read_current_filtering(){
  var columns = new Array();
  $("#Filter .filterCheckbox:checked").each(function() {
    columns.push([$(this).data('displayname'), $(this).attr('name')]);
  });
  return columns;
}
*/
