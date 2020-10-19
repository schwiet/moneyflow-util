const csv = require( 'csv-parser' )
const yaml = require('js-yaml');
const fs = require( 'fs' )
const path = require( 'path' )

// parse the command line arguments, there should only be one (after the two
// standard args passed to a process)
const args = process.argv.slice( 2 )

if( args.length < 1 ){
    console.error( "Please provide the path to the .csv file" )
    process.exit( -1 )
}

// OK, the user povided an argument, is it a valid file?
const filePath = args[ 0 ]
if( path.extname( filePath ) !== '.csv' ){
    console.error( `${filePath} must be a .csv file` )
    process.exit( -1 )
}
if( !fs.existsSync( filePath ) ){
    console.error( `${filePath} does not appear to exist` )
    process.exit( -1 )
}
// this part assumes there's a corresponding .yaml file
const fext = filePath.split( '.' )
fext[ fext.length - 1 ] = 'yaml'
const yamlPath = fext.join( '.' )
if( !fs.existsSync( yamlPath ) ){
    console.error( `${yamlPath} does not appear to exist` )
    process.exit( -1 )
}

// load the yaml helper file
let info
try {
  info = yaml.safeLoad(fs.readFileSync( yamlPath, 'utf8'));
} catch (e) {
  console.error(e);
  process.exit( -1 )
}

console.log( 'YAML', info )

// get rid of spaces and use lower-case headers
const mapHeaders = ( { header } ) => header.trim().toLowerCase()
const mapValues = ( { value } ) => {
    let result = value.trim()
    // cast to a number, if it is one
    if( result !== '' && !isNaN( result ) ){
        result = +result;
    }
    return result
}

// adds the passed enty to the appropriate month, adding a record for the month
// if necessary
const groupByMonth = months => entry => {
    let month = months[ entry.month ]
    // ensure theres an array for that month
    if( !month ){
        month = []
        months[ entry.month ] = month
        months.months.push( entry.month )
    }
    month.push( entry )
    months.total += 1;
}

// read the CSV entries into an arrays of key:value pairs per month
const transactions = { total: 0, months: [] }
const splitTransactions = groupByMonth( transactions )
fs.createReadStream( filePath )
  .pipe( csv( { mapHeaders, mapValues } ) )
  .on('data', splitTransactions )
  .on( 'end', () => {
      console.log( `read ${transactions.total} transactions, covering months: ${transactions.months}` )
  });
