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

          var swift01 = "https://swiss-backup.infomaniak.com/identity/v3"
          var swift02 = "https://swift02-api.cloud.infomaniak.ch/identity/v3"
          var swift03 = "https://swift03-api.cloud.infomaniak.ch/identity/v3"
          var swift04 = "https://swift04-api.cloud.infomaniak.ch/identity/v3"

          var post = new PostMethod("https://swiss-backup.infomaniak.com/identity/v3/auth/tokens");
          var post2 = new PostMethod("https://swift02-api.cloud.infomaniak.ch/identity/v3/auth/tokens");
          var post3 = new PostMethod("https://swift03-api.cloud.infomaniak.ch/identity/v3/auth/tokens");
          var post4 = new PostMethod("https://swift04-api.cloud.infomaniak.ch/identity/v3/auth/tokens");

          post.setRequestEntity(requestEntity);
          post2.setRequestEntity(requestEntity);
          post3.setRequestEntity(requestEntity);
          post4.setRequestEntity(requestEntity);


          var status = client.executeMethod(post);
          var status2 = client.executeMethod(post2);
          var status3 = client.executeMethod(post3);
          var status4 = client.executeMethod(post4);

          post.releaseConnection();
          post2.releaseConnection();
          post3.releaseConnection();
          post4.releaseConnection();


          if (status == HttpStatus.SC_CREATED || status2 == HttpStatus.SC_CREATED || status3 == HttpStatus.SC_CREATED || status4 == HttpStatus.SC_CREATED ) { // 201
            if (status == HttpStatus.SC_CREATED) {
              return { result : 0, post: swift01}
            } else if (status2 == HttpStatus.SC_CREATED) {
              return { result : 0, post: swift02}
            } else if (status3 == HttpStatus.SC_CREATED) {
              return { result : 0, post: swift03}
            } else if (status4 == HttpStatus.SC_CREATED) {
              return { result : 0, post: swift04}
            }
            return { result : 0 };

          } else if (status == HttpStatus.SC_UNAUTHORIZED && status2 == HttpStatus.SC_UNAUTHORIZED && status3 == HttpStatus.SC_UNAUTHORIZED && status4 == HttpStatus.SC_UNAUTHORIZED ) { // 401

              return { type: "error", message: "The Swissbackup identifiers are not correct, please check the connection information in your emails" };

          }

          return { type: "error", message: "unknown error", status: status3 };
