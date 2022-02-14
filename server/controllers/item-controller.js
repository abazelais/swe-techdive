/* eslint-disable no-undef, arrow-body-style */

//import { Exam } from "../models/exam-model.js";
//import { Patient } from "../models/patient-model.js";

export const getItems = (schemaName, name) => {
  return async (req, res) => {
    await schemaName.find({}, (err, items) => {
      if (err) {
        console.error(`Error getting ${name} data': ${err}`);
        return res.status(400).json({
          success: false,
          error: err,
        });
      }
      if (!items.length) {
        console.error(`${name} not found`);
        return res.status(200).json([]);
      }
      console.log(`Fetching successful!`);
      return res.status(200).json(items);
    }).catch(err => {
      console.error(`Error fetching the data': ${err}`);
      console.error(err);
      return res.status(404).json({
        success: false,
        error: err,
      });
    });
  }
}


export const getItemById = (schemaName, name) => {

  return async (req, res) => {
    await schemaName.find(name === "exam" ? { patient: req.params.id } : { _id: req.params.id }, (err, items) => {
      if (err) {
        console.error(`Status 400: getItemsById: ${err}`);
        throw res.status(400).json({
          success: false,
          error: err,
        });
      }
      if (!items.length) {
        console.error(`Hack_avengers - 404 in 'getItemsById': ${name} not found`);
        return res.status(404).json({
          success: false,
          error: `${name} not found`,
        });
      }
      console.log(`Hack_avengers - 200 in 'getItemById': ${name} fetched!`);
      return res.status(200).json(items);
    }).catch(err => {
      console.error(`Hack_avengers - caught error in 'getItemsById': ${err}`);
      console.error(err);
      return err;
    });
  };
}

export const createItem = (schemaName, name) => {
  return (req, res) => {
    const body = req.body;
    const id = req.params.id;

    // patient
    if (!body) {
      return res.status(400).json({
        success: false,
        error: `You must provide an ${name}.`,
      });
    }

    let item;
    if (name === "exam") {
      item = new schemaName({
        image: body.image,
        score: body.score,
        examInfo: body.examInfo,
        keyFindings: body.keyFindings,
        patient: id
      }); //create new record for exam
    } else {
      item = new schemaName(body); //create new record
    }



    if (!item) {
      console.error(`Hack_avengers - 400 in create${name}: '${name}' is malformed.`);
      return res.status(400).json({
        success: false,
        message: `'${name}' is malformed`,
      });
    }


    return item
      .save()
      .then(() => {
        console.error(`Hack_avengers - 201 in 'createItem': ${name} created!`);
        return res.status(201).json({
          success: true,
          id: item._id,
          message: `${name} created!`,
        });
      })
      .catch(err => {
        console.error(`Hack_avengers - caught error in 'createItem'`);
        Object.keys(err.errors).forEach(errorKey => {
          console.error(`Hack_avengers ERROR for: ${errorKey}`);
          console.error(
            `Hack_avengers => ${((err.errors[errorKey] || {}).properties || {}).message
            }`,
          );
        });
        return res.status(400).json({
          success: false,
          error: err.errors,
          message: err.errors.name,
        });
      });
  };
}

export const updateItem = (schemaName, name) => {
  return async (req, res) => {

    const body = req.body;
    const arryOfItem = [body]
    if (!body) {
      console.error(`Hack_avengers - 400 in 'update${name}': You must provide ${name} to update.`);
      return res.status(400).json({
        success: false,
        error: `You must provide ${name} to update.`,
      });
    }

    const itemForUpdate = { ...arryOfItem }[0]


    try {
      await schemaName.findOneAndUpdate(name === "exam" ? { patient: req.params.id } : { _id: req.params.id }, itemForUpdate);
    } catch (err) {
      console.error(`Hack_avengers - caught error in 'update${name}': ${err}`);
      console.error(err);
      return res.status(400).json({
        success: false,
        error: err,
      });
    }

    console.log(`Hack_avengers - 200 in 'update${name}': ${name} updated!`);
    return res.status(200).json({
      success: true,
      id: req.params.id,
      message: `${name} updated!`,
    });
  };
}

export const deleteItem = (PatientSchema, ExamSchema, name) => {
  return async (req, res) => {
    const oneExam = await ExamSchema.findOne({ patient: req.params.id });
    // delete from both patient and exam
    if (name === "patient") {
      //** DELETING FROM PATIENT SCHEMA*/
      await PatientSchema.findOneAndDelete({ _id: req.params.id }, (err, item) => {
        if (err) {
          console.error(`Hack_avengers - 400 in 'delete${name}': ${err}`);
          return res.status(400).json({
            succes: false,
            error: err,
          });
        }

        if (!item) {
          console.error(`Hack_avengers - 400 in 'delete${name}': ${name} not found!`);
          return res.status(400).json({
            success: false,
            error: `${name} not found!`,
          });
        }

        if(!oneExam){
          return res.status(200).json({
            success: true,
            // item: item,
          });
        }
        
      }).catch(err => {
        console.error(`Hack_avengers - caught error in 'delete${name}': ${err}`);
        console.error(err);
        return err;
      });
      //if (deletedPatient.Exam) {

      //** DELETING FROM EXAM SCHEMA*/


        if(!oneExam){
          return;
        } else {
          await ExamSchema.deleteOne({ patient: req.params.id }, (err, item) => {
            if (err) {
              console.error(`Hack_avengers - 400 in 'delete exam': ${err}`);
              return res.status(400).json({
                succes: false,
                error: err,
              });
            }
  
            if (!item) {
              console.error(`Hack_avengers - 400 in 'delete${name}': ${name} not found!`);
              return res.status(400).json({
                success: false,
                error: `exam data not found!`,
              });
            }
  
            return (
              // res.setHeader('Content-Type', 'application/json'),
              res.status(200).json({
              success: true,
            }));
          }).catch(err => {
            console.error(`Hack_avengers - caught error in 'delete${name}': ${err}`);
            console.error(err);
            return err;
          });
        }
    } else {

      // delete only from exam schema
      await ExamSchema.findOneAndDelete({ patient: req.params.id }, (err, item) => {
        if (err) {
          console.error(`Hack_avengers - 400 in 'delete${name}': ${err}`);
          return res.status(400).json({
            succes: false,
            error: err,
          });
        }

        if (!item) {
          console.error(`Hack_avengers - 400 in 'delete${name}': ${name} not found!`);
          return res.status(400).json({
            success: false,
            error: `${name} not found!`,
          });
        }

        return (
        res.status(200).json({
          success: true,
        }));
      }).catch(err => {
        console.error(`Hack_avengers - caught error in 'delete${name}': ${err}`);
        console.error(err);
        return err;
      });

    }
  };
}

export const getFromTwoSchema = (patientName, examName, name) => {
  return async (req, res) => {

    let examsDatas = await examName.find({});

    const allData = examsDatas.map(async exam => {
      const patient = await patientName.find({_id: exam.patient});
      // console.log(patient)
      // console.log(exam)
      // console.log(patient.concat(exam))
      return patient.concat(exam);
    });

    const items = await Promise.all(allData);
    // console.log(items)
   const file = items.map(item => item).map(stuff => stuff).reduce((accumulator, item) => {
    return [{...accumulator, ...item}];
  }, []);
  //   const newItem = items.map(item => item)
  //   //  console.log(...newItem)
  //  const file = [...newItem]

  //   console.log(...items)
    // let merged = {...items}

    // let merged = {};
    // file.map(item => merged={...merged, ...item})
    console.log(file)

    // const result = file.reduce((accumulator, item) => {
    //   return [{...accumulator, ...item}];
    // }, []);
    // console.log(result)

    return res.status(200).json(file);
  };
};