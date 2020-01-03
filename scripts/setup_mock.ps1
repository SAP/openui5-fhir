# Performs a POST request to the FHIR server with the given body
function Send-FHIR-Data($body){
  Invoke-RestMethod -Uri 'http://localhost:8080/fhir/R4/' -Method 'POST' -Body $body -ContentType 'application/json;charset=utf-8'
}

# Checks if the FHIR server is available
function Is-Server-Available(){
  $response = $null
  try {
    $response = (Invoke-WebRequest -Uri 'http://localhost:8080' -ErrorAction SilentlyContinue).StatusCode -eq "200"
  } catch{
    $response = $FALSE
  }
  return $response
}

# Blocks further command execution until the FHIR server is available
function Wait-Until-Server-Is-Available(){
  while((Is-Server-Available) -eq $FALSE){
    Write-Host "Server is starting..."
    Start-Sleep -s 3
  }
  Write-Host "Server is started."
}

git clone https://github.com/hapifhir/hapi-fhir-jpaserver-starter.git hapi-fhir-jpaserver
cd hapi-fhir-jpaserver
# checkout specific commit to stabilize pipeline
git checkout master
git checkout 38c711dabfa5433036a949be639b769f47d122c9
(Get-Content src/main/java/ca/uhn/fhir/jpa/starter/JpaRestfulServer.java) -replace 'config.addAllowedHeader\(HttpHeaders.ORIGIN\);', 'config.addAllowedHeader(HttpHeaders.ORIGIN);config.addAllowedHeader(HttpHeaders.IF_MATCH);config.addAllowedHeader("x-csrf-token");' | Set-Content src/main/java/ca/uhn/fhir/jpa/starter/JpaRestfulServer.java
(Get-Content src/main/webapp/WEB-INF/web.xml) -replace '/fhir/', '/fhir/R4/' | Set-Content src/main/webapp/WEB-INF/web.xml
(Get-Content src/main/resources/hapi.properties) -replace 'server_address=http://localhost:8080/hapi-fhir-jpaserver/fhir', 'server_address=http://localhost:8080/fhir/R4' | Set-Content src/main/resources/hapi.properties
(Get-Content pom.xml) -replace '<contextPath>/hapi-fhir-jpaserver</contextPath>', '<contextPath></contextPath>' | Set-Content pom.xml
(Get-Content Dockerfile) -replace '/var/lib/jetty/webapps/hapi-fhir-jpaserver.war', '/var/lib/jetty/webapps/root.war' | Set-Content Dockerfile
mvn clean install -DskipTests -q
docker build -t hapi-fhir-jpaserver .
docker run -p 8080:8080 -d hapi-fhir-jpaserver
Wait-Until-Server-Is-Available
cd ..
Remove-Item ./hapi-fhir-jpaserver -Recurse -Force
Send-FHIR-Data(Get-Content test/data/StructureDefinition.json -Encoding utf8)
Send-FHIR-Data(Get-Content test/data/CodeSystem.json -Encoding utf8)
Send-FHIR-Data(Get-Content test/data/ValueSet.json -Encoding utf8)
Send-FHIR-Data(Get-Content test/data/Encounter.json -Encoding utf8)
Send-FHIR-Data(Get-Content test/data/Patient.json -Encoding utf8)
Send-FHIR-Data(Get-Content test/data/Practitioner.json -Encoding utf8)
Send-FHIR-Data(Get-Content test/data/PractitionerRole.json -Encoding utf8)
Send-FHIR-Data(Get-Content test/data/Organization.json -Encoding utf8)
Send-FHIR-Data(Get-Content test/data/Coverage.json -Encoding utf8)
# update a specific patient to test versioning
Send-FHIR-Data(Get-Content test/data/update-patient.json -Encoding utf8)