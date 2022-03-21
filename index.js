const config = require("./config.json");
const FileSystem = require("fs");
const oracledb = require("oracledb");
const { create } = require('xmlbuilder2');
//const xml2js = require('xml2js')
//oracledb.autoCommit = true;
oracledb.initOracleClient({libDir:'E:/oracl'})

const date = new Date()
const month = ("0" + (date.getMonth() + 1)).slice(-2)
const year = date.getFullYear()

function run() {
  return new Promise(async function (resolve, reject) {
    let connection;
    try {
      connection = await oracledb.getConnection({
        user: config.user,
        password: config.password,
        connectString: config.url,
      });
      console.log("DB connected");

      const { rows } = await connection.execute(
        `select CUS_CIVIL_NO as nationalId,to_char('') as secondaryId ,to_char('') as secondaryIdType 
        ,CUS_NAM_L as arabicName,to_char('') as englishName ,to_char(sh.cus_birthday,'yyyymmdd') as birthDate,birth_gov_cod as birthGovCode
        ,CBE_GENDER as gender,id_gov_cod as residenceGovCode,CBE_NATIONAL_ALPHA as nationality 
        from customer_tab_good_sh_gap sh,cbe_national@abe_31102021, cbe_gender@abe_31102021
        where 
        sh.cus_sex = cbe_gender.abe_gendera
        and sh.cus_nationalt = cbe_national.cbe_national_code`,
        []
      );
      const root = create({version:'1.0', encoding:'utf-8'})
                          .ele('document', {})
                            .ele('header',{})
                            .ele('bankCode').txt('8201').up()
                            .ele('month').txt(year+month).up()
                            .ele('noOfCustomers').txt(`${rows.length}`).up()
                            .up()
                           .ele('customers',{})
       console.log(rows.length)
      for (var i=0; i<rows.length; i++) {
                          root.ele('customer',{})
                            .ele('nationalId').txt(rows[i][0]).up()
                            .ele('secondaryId',{}, '').txt(rows[i][1]).up()
                            .ele('secondaryIdType').txt(rows[i][2]).up()
                            .ele('arabicName').txt(rows[i][3]).up()
                            .ele('englishName').txt(rows[i][4]).up()
                            .ele('birthDate').txt(rows[i][5]).up()
                            .ele('birthGovCode').txt(rows[i][6]).up()
                            .ele('gender').txt(rows[i][7]).up()
                            .ele('residenceGovCode').txt(rows[i][8]).up()
                            .ele('nationality').txt(rows[i][9]).up()
                            .up()
      };
      const xml = root.end({prettyPrint: true,allowEmptyTags:true});
      // console.log(xml)

      let full_file_name = "./"  + "cust.xml";
      FileSystem.writeFileSync(full_file_name, xml, function(err){
        if (err) throw err;
      })
    } catch (err) {
      console.log(err);
      //reject(err);
    } finally {
      console.log("done");
      connection.release((err) => console.log(err));
    }
    setTimeout(() => {}, 7000);
  });
}
run();
