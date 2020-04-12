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

          post.setRequestEntity(requestEntity);

          var status = client.executeMethod(post);

          post.releaseConnection();

          if (status == HttpStatus.SC_CREATED) { // 201

            return { result : 0 };

          } else if (status == HttpStatus.SC_UNAUTHORIZED) { // 401

              return { type: "error", message: "Les identifiants Swissbackup ne sont pas corrects, veuillez vérifier les informations de connexions dans vos mails" };

          }

          return { type: "error", message: "unknown error" };
