import org.apache.commons.httpclient.HttpClient;

import org.apache.commons.httpclient.HttpStatus;

import org.apache.commons.httpclient.methods.PostMethod;

import org.apache.commons.httpclient.methods.StringRequestEntity;

          var client = new HttpClient();

          var name = "${settings.User}";

          var password = "${settings.key}";

          var requestEntity = new StringRequestEntity(toJSON({

              "auth": {

                  "identity": {

                      "methods": [

                          "password"

                      ],

                      "password": {

                          "user": {

                              "domain": {

                                  "id": "default"

                              },

                              "name": name,

                              "password": password

                          }

                      }

                  },

                  "scope": {

                      "project": {

                          "domain": {

                              "id": "default"

                          },

                          "name": "sb_project_${settings.User}"

                      }

                  }

              }

          }), "application/json", "UTF-8");

          var post = new PostMethod("https://swiss-backup.infomaniak.com/identity/v3/auth/tokens");
          var post2 = new PostMethod("https://swift02-api.cloud.infomaniak.ch/identity/v3/auth/tokens");


          post.setRequestEntity(requestEntity);
          post2.setRequestEntity(requestEntity);


          var status = client.executeMethod(post);
          var status2 = client.executeMethod(post2);

          post.releaseConnection();
          post2.releaseConnection();


          if (status == HttpStatus.SC_CREATED || status2 == HttpStatus.SC_CREATED ) { // 201

            return { result : 0 };

          } else if (status == HttpStatus.SC_UNAUTHORIZED && status2 == HttpStatus.SC_UNAUTHORIZED ) { // 401

              return { type: "error", message: "The Swissbackup identifiers are not correct, please check the connection information in your emails" };

          }

          return { type: "error", message: "unknown error" };
