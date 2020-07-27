const csv = require( 'csv-parser' )
const fs = require( 'fs' )

// parse the command line arguments, there should only be one (after the two
// standard args passed to a process)
const args = process.argv.slice( 2 )

if( args.length < 1 ){
    console.error( "Please provide the path to the .csv file" )
    process.exit( -1 )
}
