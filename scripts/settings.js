import org.yaml.snakeyaml.Yaml;

var resp = jelastic.environment.control.GetEnvs(appid, session);
var FileReadResponse2 = {};
var backupTemplate = "c3c375b4-83c6-434c-b8af-8ea6651e246d";
var nodesArray = [];
var nodesName = {};
var ids = [];
var conteneur = '';
var file = '';

if (resp.result != 0) return resp;

for (var i = 0; envInfo = resp.infos[i]; i++) {
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
var params = {
    session: session,
    path: "/home/plan.json",
    nodeType: "",
    nodeGroup: ""
}
for (var x = 0, n = ids.length; x < n; x++) {

    nodesName[nodesArray[x]] = nodesArray[x];
    restoNodes[nodesArray[x]] = nodesArray[x];

}




ids.forEach(function(element) {
    var FileReadResponse = jelastic.environment.file.Read(element.name, params.session, params.path, params.nodeType, params.nodeGroup, element.id);
    if (FileReadResponse.result != 0) {
        delete nodesName['node'.concat('', element.id + '-').concat('', element.name)];
    } else {
        file = FileReadResponse.body;
        file = file.replace(/T+(?=\d)/g, ' ');
        var array = toNative(new Yaml().load(file));
        array.forEach(function(michel) {
            if (!FileReadResponse2[michel["name"]]) {
                FileReadResponse2[michel["name"]] = {};
            }
            var toDisplay = michel["date"] + " " + michel["path"];
            FileReadResponse2[michel["name"]][michel["id"]] = toDisplay
        })
    }
});

return {
    result: 0,
    "settings": {
        "main": {
            "fields": [

                {
                    "name": "User",
                    "caption": "Swiss Backup username",
                    "type": "string",
                    "required": true,
                    "placeholder": "SBI-234567",
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
                        "backup": "Back up your data"
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
                                "tooltip": "See our FAQ <a href='https://www.infomaniak.com/fr'>Add-on SwissBackup</a> section restoration",
                                "name": "nodes",
                                "hidden": false,
                                "values": nodesName,
                                "columns": 2
                            },

                            {
                                "caption": "Select backup",
                                "tooltip": "UTC time",
                                "type": "list",
                                "name": "snapshot",
                                "required": true,
                                "dependsOn": {
                                    "nodes": FileReadResponse2

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
                                "values": {
                                    "full": "Back up all files",
                                    "folder": "Back up specific folders"
                                },
                                "default": "full",
                                "showIf": {
                                    "full": [{
                                        "type": "displayfield",
                                        "cls": "x-item-disabled",
                                        "markup": "Some system files will be excluded. See our FAQ <a target='_blank' href='https://www.infomaniak.com/fr'>Add-on SwissBackup</a> for more detail.",
                                        "name": "info",
                                        "hidden": false
                                    }],
                                    "folder": [{
                                        "name": "path",
                                        "caption": "Folders to back up",
                                        "regex": "[^s/ *]",
                                        "regexText": "Use Snapshot of the whole container button for backup / ",
                                        "type": "string",
                                        "placeholder": "path/to/folder1/, path/to/folder2/, path/to/folderX"
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
                                "tooltip": "See our FAQ for more details",
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
                                        "regex": "^[0-9]$|^[0-9][0-99]$",
                                        "regexText": "0-99",
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
                                        "regex": "^[0-9]$|^[0-9][0-99]$",
                                        "regexText": "0-99",
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
                                        "default": "0",
                                        "required": "true",
                                        "hidden": false
                                    },


                                    {
                                        "type": "displayfield",
                                        "height": 5,
                                        "hideLabel": true,
                                        "markup": "Hours"
                                    },
                                    {
                                        "width": 37,
                                        "name": "hour",
                                        "regex": "^[0-9]$|^[0-9][0-99]$",
                                        "regexText": "0-99",
                                        "type": "string",
                                        "default": "0",
                                        "required": "true",
                                        "hidden": false
                                    }

                                ]
                            },
                            {
                                "type": "list",
                                "name": "sauvegarde",
                                "caption": "Backup frequency",
                                "tooltip": "See our FAQ <a target='_blank' href='https://www.infomaniak.com/fr'>Add-on SwissBackup</a> section back up frequency",
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
