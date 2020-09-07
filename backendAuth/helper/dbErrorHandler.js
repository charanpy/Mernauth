
const uniqueMessage = error => {
            let output;
            try {
                        let fieldName = error.message.split(".$")[1]
                        field = field.split("dub key")[0];
                        field = field.substring(0, fieldIndexOf("..."))
                        req.flash("errors", [{
                                    messages: 'An account with this' + field + 'already exists'
                        }])
                        output = fieldName.charAt[0].toUpperCase() + fieldName.slice(1) + 'already exists'
            } catch (e) {
                        output = 'already exists'
            }
            return output;
}

//!get error msg from object

exports.errorHandler = err => {
            let message = '';
            if (err.code) {
                        switch (err.code) {
                                    case 11000:
                                    case 11001:
                                                message = uniqueMessage(err)
                                                break;
                                    default:
                                                message = "Something went wrong!"
                        }
            } else {
                        for (let errName in err.errors) {
                                    if (err.errors[errName].message) {
                                                message = err.errors[errName].message
                                    }
                        }
            }
            return message;
}