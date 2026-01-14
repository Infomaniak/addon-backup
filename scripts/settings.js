import org.yaml.snakeyaml.Yaml;

var resp = jelastic.environment.control.GetEnvs(appid, session);
var listBackups = {};
var backupTemplate = "c3c375b4-83c6-434c-b8af-8ea6651e246d";
var nodesArray = [];
var nodesName = {};
var ids = [];
var conteneur = '';
var file = '';
var nodesHostname = {};
if (resp.result != 0) return resp;


for (var i = 0; envInfo = resp.infos[i]; i++) {
    if (envInfo.env.status == "1") {
        jelastic.marketplace.console.WriteLog("env is started" + envInfo.env.domain)
        for (var j = 0; node = envInfo.nodes[j]; j++) {
            for (var m = 0; add = node.addons[m]; m++) {
                if (add.appTemplateId == backupTemplate) {
                    var conteneur = node.adminUrl.replace("https://", "").replace("http://", "").replace(/\..*/, "").replace("docker", "node").replace("vds", "node");
                    nodesArray.push(conteneur);
                    ids.push({
                        name: conteneur.substring(conteneur.indexOf('-') + 1, conteneur.length),
                        id: conteneur.substring(4, conteneur.indexOf('-'))
                    });
                }
            }
        }
    }
}
var params = {
    session: session,
    path: "/home/plan.json",
    nodeType: "",
    nodeGroup: ""
}
local_date = 0;
ids.forEach(function(element) {


    var FileReadResponse = jelastic.environment.file.Read(element.name, params.session, params.path, params.nodeType, params.nodeGroup, element.id);

    if (FileReadResponse.result != 0) {
        delete nodesName['node'.concat('', element.id + '-').concat('', element.name)];
    } else {
        file = FileReadResponse.body;
        var plan = toNative(new Yaml().load(file));
        if (plan.last_update > local_date) {
            local_date = plan.last_update;
            plan.backup_plan.forEach(function(objectBackup) {
                if (!listBackups[objectBackup["name"]]) {
                    listBackups[objectBackup["name"]] = {};
                }
                var toDisplay = objectBackup["date"].replace('T', ' ') + " " + objectBackup["path"] + " " + objectBackup["size"];
                listBackups[objectBackup["name"]][objectBackup["id"]] = toDisplay

                nodesHostname[objectBackup.name] = objectBackup.name;
            })
        }


    }
});
return {
    result: 0,
    "settings": {
        "formId": "swiss-backup-create",
        "formCfg": {
            "fields": [

                {
                    "name": "User",
                    "caption": "Swiss Backup username",
                    "type": "string",
                    "required": true,
                    "default": "SBI-"
                }, {
                    "name": "key",
                    "caption": "Password",
                    "type": "string",
                    "required": false,
                    "inputType": "password"
                },
                {
                    "caption": "__________________________________________________________________________________",
                    "cls": "x-item-disabled",
                    "type": "displayfield",
                    "name": "exemple",
                    "hidden": false
                },

                {
                    "type": "compositefield",
                    "hideLabel": true,
                    "pack": "center",
                    "name": "wp_protect",
                    "items": [{
                        "type": "displayfield",
                        "cls": "x-item-disabled",
                        "value": "<h3>What action do you want to perform?</h3>",
                    }]
                },

                {
                    "name": "mode",
                    "type": "radio-fieldset",
                    "values": {
                        "restauration": "Restore your data",
                        "backup": "Backup your data"
                    },
                    "default": "backup",
                    "showIf": {
                        "restauration": [{
                                "caption": "__________________________________________________________________________________",
                                "cls": "x-item-disabled",
                                "type": "displayfield",
                                "name": "exemple",
                                "hidden": false
                            },

                            {
                                "type": "compositefield",
                                "hideLabel": true,
                                "pack": "center",
                                "name": "wp_protect",
                                "items": [{
                                    "type": "displayfield",
                                    "cls": "x-item-disabled",
                                    "value": "<h3>Select the backup you want to restore</h3>",
                                }]
                            },

                            {
                                "type": "list",
                                "caption": "Display backups for",
                                "tooltip": "See our FAQ <a target='_blank' href='https://faq.infomaniak.com/2420'>Add-on SwissBackup</a> section restoration",
                                "name": "nodes",
                                "hidden": false,
                                "values": nodesHostname,
                                "columns": 2
                            },

                            {
                                "caption": "Select backup",
                                "tooltip": "UTC time",
                                "type": "list",
                                "name": "snapshot",
                                "required": true,
                                "dependsOn": {
                                    "nodes": listBackups

                                }

                            },



                            {
                                "caption": "__________________________________________________________________________________",
                                "cls": "x-item-disabled",
                                "type": "displayfield",
                                "name": "snapshot",
                                "hidden": true
                            },

                            {
                                "type": "compositefield",
                                "hideLabel": true,
                                "pack": "center",
                                "name": "wp_protect",
                                "items": [{
                                    "type": "displayfield",
                                    "cls": "x-item-disabled",
                                    "value": "<h3>Restore configuration</h3>",
                                }]
                            },


                            {
                                "type": "radio-fieldset",
                                "name": "permissions",
                                "hidden": false,
                                "required": true,
                                "default": "classic",
                                "values": {
                                    "classic": "Keep original files permissions",
                                    "permissions": "Change files ownership"
                                },
                                "showIf": {
                                    "classic": [{
                                            "name": "destination",
                                            "caption": "Restore location",
                                            "regex": "[^s/ *]",
                                            "regexText": "please indicate other folder than / ",
                                            "type": "string",
                                            "required": true,
                                            "placeholder": "/tmp/restore/"
                                        },
                                        {
                                            "type": "displayfield",
                                            "cls": "warning",
                                            "height": 20,
                                            "hideLabel": true,
                                            "markup": "Existing files will be overwritten"
                                        }
                                    ],
                                    "permissions": [{
                                            "name": "custom",
                                            "caption": "Restore to this username",
                                            "type": "string",
                                            "required": true,
                                            "placeholder": "example: nginx"
                                        },
                                        {
                                            "name": "destination",
                                            "caption": "Restore location",
                                            "regex": "[^s/ *]",
                                            "regexText": "please indicate other folder than / ",
                                            "type": "string",
                                            "required": true,
                                            "placeholder": "/tmp/restore/"
                                        },
                                        {
                                            "type": "displayfield",
                                            "cls": "warning",
                                            "height": 20,
                                            "hideLabel": true,
                                            "markup": "Existing files will be overwritten"
                                        }
                                    ]
                                }
                            }
                        ],


                        "backup": [{
                                "caption": "__________________________________________________________________________________",
                                "cls": "x-item-disabled",
                                "type": "displayfield",
                                "name": "exemple",
                                "hidden": false
                            },

                            {
                                "type": "compositefield",
                                "hideLabel": true,
                                "pack": "center",
                                "name": "wp_protect",
                                "items": [{
                                    "type": "displayfield",
                                    "cls": "x-item-disabled",
                                    "value": "<h3>Backup configuration</h3>",
                                }]
                            },

                            {
                                "name": "choice",
                                "type": "radio-fieldset",
                                "values": [{
                                        "value": "full",
                                        "caption": "Back up all files"

                                    },
                                    {
                                        "value": "folder",
                                        "caption": "Back up specific folders"
                                    }
                                ],
                                "default": "full",
                                "showIf": {
                                    "full": [{
                                        "type": "displayfield",
                                        "cls": "x-item-disabled",
                                        "markup": "Some system files will be excluded. See our FAQ <a target='_blank' href='https://faq.infomaniak.com/2420'>Add-on SwissBackup</a> for more detail.",
                                        "name": "info",
                                        "hidden": false
                                    },
                                             {
                                            "type": "displayfield",
                                            "cls": "warning",
                                            "height": 20,
                                            "hideLabel": true,
                                            "markup": " DB server requires to be automatically backed up into a file with another tool before installation."
                                    }],
                                    "folder": [{
                                        "name": "path",
                                        "caption": "Folders to back up",
                                        "regex": "[^s/ *]",
                                        "regexText": "Use Snapshot of the whole container button for backup / ",
                                        "type": "string",
                                        "placeholder": "path/to/folder1/, path/to/folder2/, path/to/folderX"
                                    },
                                               {
                                            "type": "displayfield",
                                            "cls": "warning",
                                            "height": 20,
                                            "hideLabel": true,
                                            "markup": " DB server requires to be automatically backed up into a file with another tool before installation."
                                    }]
                                }
                            },
                            {
                                "pack": "",
                                "align": "",
                                "defaultMargins": {
                                    "top": 0,
                                    "right": 0,
                                    "bottom": 0,
                                    "left": 20
                                },
                                "defaultPadding": 0,
                                "defaultFlex": 0,
                                "caption": "Retention period",
                                "tooltip": "See our FAQ <a target='_blank' href='https://faq.infomaniak.com/2420'>Add-on SwissBackup</a> section backup retention",
                                "hideLabel": false,
                                "type": "compositefield",
                                "name": "compositefield",
                                "hidden": false,
                                "items": [{
                                        "type": "displayfield",
                                        "height": 5,
                                        "hideLabel": true,
                                        "markup": "Years"
                                    },

                                    {
                                        "width": 37,
                                        "name": "year",
                                        "regex": "^[0-1]",
                                        "regexText": "0-1",
                                        "type": "string",
                                        "default": "0",
                                        "required": "true",
                                        "hidden": false
                                    },
                                    {
                                        "type": "displayfield",
                                        "height": 5,
                                        "hideLabel": true,
                                        "markup": "Months"
                                    },


                                    {
                                        "width": 37,
                                        "name": "month",
                                        "regex": "^(1[0-2]|[0-9])$",
                                        "regexText": "0-12",
                                        "type": "string",
                                        "default": "0",
                                        "required": "true",
                                        "hidden": false
                                    },
                                    {
                                        "type": "displayfield",
                                        "height": 5,
                                        "hideLabel": true,
                                        "markup": "Days"
                                    },

                                    {
                                        "width": 37,
                                        "name": "day",
                                        "regex": "^[0-9]$|^[0-9][0-99]$",
                                        "regexText": "0-99",
                                        "type": "string",
                                        "required": "true",
                                        "hidden": false
                                    }

                                ]
                            },
                            {
                                "type": "list",
                                "name": "sauvegarde",
                                "caption": "Backup frequency",
                                "tooltip": "See our FAQ <a target='_blank' href='https://faq.infomaniak.com/2420'>Add-on SwissBackup</a> section backup frequency",
                                "values": {
                                    "daily": "Daily",
                                    "hourly": "Hourly"

                                },
                                "hideLabel": false,
                                "hidden": false,
                                "editable": false,
                                "default": "daily",
                                "required": true
                            }
                        ],

                    }
                }
            ]
        }
    }
}
