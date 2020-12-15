<template>
  <div class="container">
    <div class="py-5 text-center">
      <img class="d-block mx-auto mb-4" src="/icons/icon.png" alt="" />
      <h2>Manage All My Notes</h2>
    </div>

    <div class="row">
      <table id="note-table" class="table table-striped table-bordered" style="width:100%">
        <thead>
          <tr>
            <th>Domain</th>
            <th>Content</th>
            <th>Note</th>
            <th>Timestamp</th>
            <th></th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { getUrlHostname } from '../utils/urls';
import { formatDate } from '../utils/base';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import 'datatables.net-bs4/css/dataTables.bootstrap4.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net-buttons/js/dataTables.buttons.min';
import 'datatables.net-buttons/js/buttons.html5.min';
import 'datatables.net-buttons/js/buttons.print.min';
import { mdRender } from '../utils/md';
import 'highlight.js/styles/github.css';

export default {
  name: 'App',

  data() {
    return {
      dataTable: null,
      md: null,
    };
  },
  mounted() {
    this.dataTable = $('#note-table').DataTable({
      order: [[3, 'desc']],
      processing: true,
      dom: 'Blfrtip',
      buttons: ['copyHtml5', 'csvHtml5', 'print'],
      columns: [{ width: '20%' }, { width: '35%' }, { width: '30%' }, { width: '10%' }, { width: '5%' }],
    });
    // refreshAuthInfo().then(user => {
    // TODO: fetch notes
    const notes = {};
    this.dataTable.clear();
    for (const [key, value] of Object.entries(notes)) {
      this.dataTable.row
        .add([
          `<a href="${value.url}" target="_blank">${getUrlHostname(value.url)}</a>`,
          value.text,
          mdRender(value.note),
          formatDate(value.createdTime),
          `<button type="button" data-id="${key}" class="btn btn-danger note-delete-btn">Delete</button>`,
        ])
        .draw(false);
    }
    const self = this;
    $('.note-delete-btn').on('click', function(event) {
      event.preventDefault();
      const id = $(this).data('id');
      if (id) {
        self.deleteNote(id);
      }
    });
    // });
  },
  methods: {
    deleteNote(noteId) {
      if (confirm('Are you sure to delete this?')) {
        // TODO: delete note
      }
    },
  },
};
</script>

<style>
.dataTables_wrapper {
  width: 100%;
}

.dataTables_filter,
.dt-buttons,
.dataTables_paginate,
.dataTables_info,
.dataTables_length {
  display: inline-block;
}

.dataTables_filter,
.dataTables_paginate {
  float: right;
}

.dataTables_length {
  margin-left: 10px;
}
</style>
