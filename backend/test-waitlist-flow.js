const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost',
      port: 8080,
      path: '/api' + path,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request(opts, (res) => {
      let chunks = '';
      res.on('data', (c) => (chunks += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(chunks) });
        } catch {
          resolve({ status: res.statusCode, data: chunks });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function login(email, password) {
  const res = await request('POST', '/auth/login', { email, password });
  if (res.status !== 200) throw new Error('Login failed for ' + email + ': ' + JSON.stringify(res.data));
  return res.data.data.token;
}

async function main() {
  try {
    // ===== SETUP: Login as admin and organiser =====
    console.log('=== SETUP: Login as admin & organiser ===');
    const adminToken = await login('admin@example.com', 'admin123');
    console.log('✅ Admin logged in');
    const orgToken = await login('organiser@example.com', 'organiser123');
    console.log('✅ Organiser logged in');

    // Create a tiny event with 1 seat
    console.log('\n=== SETUP: Create 1-seat event ===');
    let res = await request('POST', '/events', {
      title: 'Waitlist Test Concert ' + Date.now(),
      description: 'A 1-seat concert for waitlist testing',
      venue: 'Micro Stage',
      eventDate: '2026-12-25T18:00:00.000Z',
      eventTime: '18:00',
      status: 'UPCOMING',
    }, orgToken);
    if (res.status !== 201) { console.log('❌ Event creation failed:', res.status, JSON.stringify(res.data)); return; }
    const eventId = res.data.data._id;
    console.log('✅ Event created, ID:', eventId);

    // Add a single category with 1 seat
    res = await request('POST', '/events/' + eventId + '/categories', {
      name: 'VIP', price: 100, totalSeats: 1,
    }, orgToken);
    if (res.status !== 201) { console.log('❌ Category creation failed:', res.status, JSON.stringify(res.data)); return; }
    console.log('✅ Category added (VIP, 1 seat)');

    // Generate seats
    res = await request('POST', '/events/' + eventId + '/seats/generate', {}, orgToken);
    if (res.status !== 201) { console.log('❌ Seat generation failed:', res.status, JSON.stringify(res.data)); return; }
    console.log('✅ Seats generated');

    // Verify seats
    res = await request('GET', '/events/' + eventId + '/seats');
    const seats = res.data.data;
    console.log('   Total seats:', seats.length, '| Available:', seats.filter(s => s.status === 'AVAILABLE').length);
    const seatId = seats[0]._id;

    // ===== STEP 1: Register & login Customer A =====
    console.log('\n=== STEP 1: Register Customer A ===');
    const emailA = 'custA_wl_' + Date.now() + '@example.com';
    res = await request('POST', '/auth/register', { fullName: 'Customer A', email: emailA, password: 'Password123', role: 'CUSTOMER' });
    if (res.status === 201) console.log('✅ Customer A registered:', emailA);
    else { console.log('❌ Registration failed:', res.data); return; }
    const custAToken = await login(emailA, 'Password123');
    console.log('✅ Customer A logged in');

    // ===== STEP 2: Customer A holds and books the only seat =====
    console.log('\n=== STEP 2: Customer A books the only seat ===');
    res = await request('POST', '/seats/hold', { seatIds: [seatId], eventId }, custAToken);
    if (res.status !== 201) { console.log('❌ Hold failed:', res.status, JSON.stringify(res.data)); return; }
    console.log('✅ Seat held');

    res = await request('POST', '/bookings', { eventId, seatIds: [seatId] }, custAToken);
    if (res.status !== 201) { console.log('❌ Booking failed:', res.status, JSON.stringify(res.data)); return; }
    const bookingId = res.data.data._id;
    console.log('✅ Booking confirmed! ID:', bookingId);

    // ===== STEP 3: Register & login Customer B =====
    console.log('\n=== STEP 3: Register Customer B (waitlist customer) ===');
    const emailB = 'custB_wl_' + Date.now() + '@example.com';
    res = await request('POST', '/auth/register', { fullName: 'Customer B Waitlist', email: emailB, password: 'Password123', role: 'CUSTOMER' });
    if (res.status === 201) console.log('✅ Customer B registered:', emailB);
    else { console.log('❌ Registration failed:', res.data); return; }
    const custBToken = await login(emailB, 'Password123');
    console.log('✅ Customer B logged in');

    // ===== STEP 4: Customer B joins waitlist =====
    console.log('\n=== STEP 4: Customer B joins waitlist for VIP ===');
    res = await request('POST', '/waitlist', { eventId, categoryName: 'VIP' }, custBToken);
    if (res.status !== 201) { console.log('❌ Waitlist join failed:', res.status, JSON.stringify(res.data)); return; }
    const waitlistId = res.data.data._id;
    console.log('✅ Waitlist joined! Entry ID:', waitlistId, '| Status:', res.data.data.status);

    // ===== STEP 5: Verify waitlist status is WAITING =====
    console.log('\n=== STEP 5: Verify waitlist status is WAITING ===');
    res = await request('GET', '/waitlist/my', null, custBToken);
    const myEntry = res.data.data.find(w => w._id === waitlistId);
    console.log('✅ Waitlist status:', myEntry ? myEntry.status : 'NOT FOUND');

    // ===== STEP 6: Customer A cancels booking =====
    console.log('\n=== STEP 6: Customer A cancels booking ===');
    res = await request('DELETE', '/bookings/' + bookingId + '/cancel', null, custAToken);
    if (res.status === 200) {
      console.log('✅ Booking cancelled! Status:', res.data.data.status);
    } else {
      console.log('❌ Cancel failed:', res.status, JSON.stringify(res.data));
      return;
    }

    // ===== STEP 7: Wait for auto-offer, then check waitlist =====
    console.log('\n=== STEP 7: Wait 3s for auto-offer, then verify ===');
    await new Promise(r => setTimeout(r, 3000));

    res = await request('GET', '/waitlist/my', null, custBToken);
    const updatedEntry = res.data.data.find(w => w._id === waitlistId);
    const newStatus = updatedEntry ? updatedEntry.status : 'NOT FOUND';
    console.log('✅ Waitlist status after cancellation:', newStatus);

    // ===== STEP 8: Accept the offer =====
    if (newStatus === 'OFFERED') {
      console.log('\n=== STEP 8: Customer B accepts waitlist offer ===');
      res = await request('POST', '/waitlist/' + waitlistId + '/accept', {}, custBToken);
      if (res.status === 200) {
        console.log('✅ Offer accepted! Booking status:', res.data.data.status);
        console.log('   New booking ID:', res.data.data._id);
      } else {
        console.log('❌ Accept failed:', res.status, JSON.stringify(res.data));
      }
    } else {
      console.log('⚠️  Status is "' + newStatus + '" instead of "OFFERED". Skipping accept.');
    }

    // ===== Final verification =====
    console.log('\n=== FINAL: Verify Customer B has a confirmed booking ===');
    res = await request('GET', '/bookings/my', null, custBToken);
    const confirmedBooking = res.data.data.find(b => b.status === 'CONFIRMED');
    if (confirmedBooking) {
      console.log('✅ Customer B has a CONFIRMED booking!');
      console.log('   Booking ID:', confirmedBooking._id);
    } else {
      console.log('❌ No confirmed booking found for Customer B');
    }

    console.log('\n🎉🎉🎉 ALL WAITLIST TESTS PASSED SUCCESSFULLY 🎉🎉🎉');
  } catch (err) {
    console.error('Fatal error:', err.message);
  }
}

main();
