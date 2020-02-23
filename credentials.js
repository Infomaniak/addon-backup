import com.hivext.api.core.utils.Transport;

var name = "SBI-AJ891787";
var password = "kXzZdjJ5URbr";

var data = toJSON({
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
        "name": "some-name"
      }
    }
  }
});

try {
    new Transport().post("https://swiss-backup.infomaniak.com/identity/v3/credentials", data, {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    });

    return {
      type: "success",
      result: 0
     };
} catch (e) {
    return {
        type: "error",
        result: 401,
        message: "unknown error: "
    }};
}
